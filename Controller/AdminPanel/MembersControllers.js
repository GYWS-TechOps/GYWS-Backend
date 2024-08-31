import mongoose from "mongoose";
import Member from "../../models/AdminPanel/members.model.js";
import Years from "../../models/AdminPanel/years.model.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Readable } from "stream";
import updateYearsWithMemberTeams from "../../Middlewares/AdminPanel/Member_Year_connect.js"
import { addTeamData } from "../../Middlewares/AdminPanel/team_methods.js";



//Add Member
const addMember = async (req, res) => {
  try {
    const { name, emails, imageUrls, phoneNumbers, facebookLink, linkedinLink, state, city, dateOfBirth, rollNo, teams } = req.body;

    // Generate member_id from the name and the first email in the array
    const _id = `${name.toLowerCase().replace(/\s+/g, '')}-${emails[0].toLowerCase().replace(/\s+/g, '')}`;


    // Check if a member with the same member_id already exists
    const existingMember = await Member.findOne({ _id });

    if (existingMember) {
      // Update the existing member
      return res.status(400).json({message: "Member already exists"});
    } else {
      // Create a new member
      const newMember = new Member({
        _id,
        name,
        emails,
        imageUrls,
        phoneNumbers,
        facebookLink,
        linkedinLink,
        state,
        city,
        dateOfBirth,
        rollNo,
        teams,
      });

      await newMember.save();
    }

   

    res.status(200).json({ message: "Member added successfully."});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding/updating the member." });
  }
};

const editMember = async (req, res) => {
  try {
    // Extract _id from params and other data from req.body
    const { _id } = req.params;
    const { teams, ...otherFields } = req.body;

    // Ensure updateData is correctly structured
    const updateData = { 
      ...otherFields,
      teams: teams || []  // Ensure teams is an array, even if empty
    };

    // Verify that the member exists with the provided _id
    const existingMember = await Member.findById(_id);

    if (!existingMember) {
      return res.status(404).send({ message: "Member not found with the provided _id" });
    }

    // Update the member in the Member schema
    const updatedMember = await Member.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // After updating the member, update the Years schema
    await updateYearsWithMemberTeams(_id);

    res.status(200).send({ message: "Member updated successfully", updatedMember });
  } catch (err) {
    res.status(500).send({ message: "An error occurred", error: err.message });
  }
};

//function to add MemberData
const addMemberData = async (req, res) => {
  try {
    const { _id } = req.params;
    const {
      teams,
      emails,
      imageUrls,
      phoneNumbers,
      ...otherFields
    } = req.body;

    const existingMember = await Member.findById(_id);

    if (!existingMember) {
      return res.status(404).send({ message: "Member not found with the provided _id" });
    }

    const updateData = { ...otherFields };

    if (emails) {
      updateData.emails = [...new Set([...existingMember.emails, ...emails])];
    }

    if (imageUrls) {
      updateData.imageUrls = [...new Set([...existingMember.imageUrls, ...imageUrls])];
    }

    if (phoneNumbers) {
      updateData.phoneNumbers = [...new Set([...existingMember.phoneNumbers, ...phoneNumbers])];
    }

    if (teams) {
      updateData.teams = addTeamData(existingMember.teams, teams);
    }

    const updatedMember = await Member.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (updateData.teams) {
      await updateYearsWithMemberTeams(_id);
    }

    res.status(200).send({ message: "Member data added successfully", updatedMember });
  } catch (err) {
    res.status(500).send({ message: "An error occurred", error: err.message });
  }
};

// Get Member
async function getMember(req, res) {
  try {
    const { _id } = req.query;

    const member = await Member.findById(_id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ member });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get member", error: error.message });
  }
}

// Get All Members
async function getAllMembers(req, res) {
  try {
    const members = await Member.find();
    res.status(200).json({ members });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get members", error: error.message });
  }
}

// Delete Member
async function deleteMember(req, res) {
  try {
    const { _id } = req.params;
    if(!_id){
      return res.status(400).json({message: "Member ID is required"});
    }
    // Try to delete the member by id
    const deletedMember = await Member.findByIdAndDelete(_id);

    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete member", error: error.message });
  }
}

async function getMemberByPosOrYear(req, res) {
  try {
    const { year, position, team } = req.query;

    const query = {};
    if (year) query['teams.year'] = year;
    if (position) query['teams.teamAndpos.position'] = position;
    if (team) query['teams.teamAndpos.team'] = team;

    const members = await Member.find(query);

    if (members.length === 0) {
      return res.status(404).json({ message: "No members found" });
    }

    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ message: "Failed to get members", error: error.message });
  }
}






async function importCSVData(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const batchSize = parseInt(req.query.batchSize) || 100;

    const members = [];
    const errors = []; 

    const stream = Readable.from(file.buffer.toString());

    stream
      .pipe(csv())
      .on("data", async (row) => {
        try {
          const phoneNumberString = typeof row.phoneNumbers === "string" ? row.phoneNumbers : "";
          const otherEmailsString = typeof row.otherEmails === "string" ? row.otherEmails : "";

          const filteredPhoneNumbers = phoneNumberString
            .split(",")
            .map((phone) => phone.trim())
            .filter((phone) => phone);
          const filteredEmails = otherEmailsString
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email);

          if (!row.email) {
            errors.push({ row, error: "At least one valid email is required" });
            return;
          }
          
          const member_id = `${row.year}-${row.pos}-${row.email}` || uuidv4();

          const existingMember = await Member.findOne({ email: row.email });

          if (existingMember) {
            errors.push({ row, error: `Member with email ${row.email} already exists` });
            return;
          }

          const newMember = {
            member_id,
            name: row.name,
            position: row.position,
            pos: row.pos,
            emails: [row.email, ...filteredEmails],
            imageUrls: [row.imageUrl],
            facebookLink: row.facebookLink,
            linkedinLink: row.linkedinLink,
            phoneNumbers: filteredPhoneNumbers,
            state: row.state || "",
            city: row.city || "",
            dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
            rollNo: row.rollNo || "",
            teams: [{ teamAndpos: [{ team: row.team, pos: row.pos, position: row.position }], year: row.year }],
          };

          members.push(newMember);

          if (members.length >= batchSize) {
            await Member.insertMany(members);
            members.length = 0;
          }
        } catch (err) {
          errors.push({ row, error: `Error processing row: ${err.message}` });
        }
      })
      .on("end", async () => {
        try {
          if (members.length > 0) {
            await Member.insertMany(members);
          }

          if (errors.length > 0) {
            res.status(400).json({ message: "Some members could not be added", errors });
          } else {
            res.status(201).json({ message: "Members added successfully" });
          }
        } catch (err) {
          res.status(500).json({ message: "An error occurred during the final insertion.", errors });
        }
      })
      .on("error", (err) => {
        res.status(500).json({ message: "An error occurred during file processing." });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const searchMember = async (req, res, next) => {
  try {
    const { searchString } = req.params; // Get the search string from request parameters

    // Define a regex to perform a case-insensitive search
    const regex = new RegExp(searchString, 'i');

    // Search in multiple fields using $or operator
    const members = await Member.find({
      $or: [
        { name: regex },
        { emails: regex },
        { phoneNumbers: regex },
        { facebookLink: regex },
        { linkedinLink: regex },
        { state: regex },
        { city: regex },
        { rollNo: regex },
        { "teams.teamAndpos.team": regex },
        { "teams.teamAndpos.pos": regex },
        { "teams.teamAndpos.position": regex }
      ]
    });

    // If no members are found, return a 404
    if (!members.length) {
      return res.status(404).json({ message: "No members found" });
    }

    // Respond with the found members as an array
    res.status(200).json(members);

  } catch (err) {
    console.error("Error searching member:", err);
    res.status(500).json({ message: "An error occurred during the search.", error: err.message });
  }
};







export {
  addMember,
  editMember,
  getMember,
  getAllMembers,
  deleteMember,
  getMemberByPosOrYear,
  addMemberData,
  searchMember,
  importCSVData,
};
