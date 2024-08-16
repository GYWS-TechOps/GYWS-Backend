import mongoose from "mongoose";
import Member from "../models/members.model.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { Readable } from "stream";

//Add member
async function addMember(req, res) {
  try {
    const {
      name,
      position,
      pos,
      email,
      facebookLink,
      linkedinLink,
      year,
      phoneNumbers,
      state,
      city,
      dateOfBirth,
      rollNo,
      team,
      otherEmails,
    } = req.body;

    //

    const phoneNumberString =
      typeof phoneNumbers === "string" ? phoneNumbers : "";
    const otherEmailsString =
      typeof otherEmails === "string" ? otherEmails : "";

    const filteredPhoneNumbers = phoneNumberString
      .split(",")
      .map((phone) => phone.trim())
      .filter((phone) => phone);
    const filteredmails = otherEmailsString
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);
    if (!email) {
      return res
        .status(400)
        .json({ message: "At least one valid email is required" });
    }

    // Generate member_id based on name, pos, and the first email
    const member_id = `${name}-${pos}-${email}`;

    // Check for existing member with the generated member_id
    const existingMember = await Member.findOne({ member_id });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "Member with this member_id already exists" });
    }

    const newMember = new Member({
      member_id,
      name,
      position,
      pos,
      email,
      imageUrl: req.body.imageUrl,
      facebookLink,
      linkedinLink,
      phoneNumbers: filteredPhoneNumbers,
      otherEmails: filteredmails,
      state,
      city,
      dateOfBirth,
      rollNo,
      year,
      team,
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//Edit Member
async function editMember(req, res) {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    // Check if the id is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

    // Process the image file if it exists in the request
    if (req.file) {
      updatedData.imageUrl = req.body.imageUrl; // Use the image URL from the request body
    }

    let updatedMember;

    if (isValidObjectId) {
      // Try to find the member by ObjectId
      updatedMember = await Member.findByIdAndUpdate(id, updatedData, {
        new: true,
      });
    }

    if (!updatedMember) {
      // Try to find the member by member_id
      updatedMember = await Member.findOneAndUpdate(
        { member_id: id },
        updatedData,
        { new: true }
      );
    }

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res
      .status(200)
      .json({ message: "Member updated successfully", member: updatedMember });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update member", error: error.message });
  }
}

// Get Member
async function getMember(req, res) {
  try {
    const { member_id, email, _id } = req.query;

    const query = {};
    if (member_id) query.member_id = member_id;
    if (email) query.email = email;
    if (_id) query._id = _id;

    const member = await Member.findOne(query);

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
    const { id } = req.params;

    // Try to delete the member by id
    let deletedMember = await Member.findByIdAndDelete(id);

    // If not found by id, try to delete by member_id
    if (!deletedMember) {
      deletedMember = await Member.findOneAndDelete({ member_id: id });
    }

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
    if (year) query.year = year;
    if (position) query.position = position;
    if (team) query.team = team;

    const members = await Member.find(query);

    if (members.length === 0) {
      return res.status(404).json({ message: "No members found" });
    }

    res.status(200).json({ members });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get members", error: error.message });
  }
}

async function importCSVData(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get batch size from query parameter, default to 100 if not provided
    const batchSize = parseInt(req.query.batchSize) || 100;

    const members = [];
    const errors = []; // Array to keep track of errors

    // Convert the buffer to a readable stream
    const stream = Readable.from(file.buffer.toString());

    stream
      .pipe(csv())
      .on("data", async (row) => {
        
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

        // Check for existing member with the same email
        const existingMember = await Member.findOne({ email: row.email });

        if (existingMember) {
          errors.push({ row, error: `Member with email ${row.email} already exists` });
          return;
        }
        console.log(row);
        const newMember = {
          member_id,
          name: row.name,
          position: row.position,
          pos: row.pos,
          otherEmails: filteredEmails,
          imageUrl: row.imageUrl,
          facebookLink: row.facebookLink,
          linkedinLink: row.linkedinLink,
          phoneNumbers: filteredPhoneNumbers,
          state: row.state || "",
          city: row.city || "",
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
          rollNo: row.rollNo || "",
          year: row.year,
          team: row.team || "",
          email: row.email,
        };

        members.push(newMember);

        // Insert batch when the batch size is reached
        if (members.length >= batchSize) {
          try {
            console.log("inserted");
            console.log(members.length)
            await Member.insertMany(members);
            members.length = 0; // Clear the array
          } catch (err) {
            errors.push({ error: "Error inserting batch", details: err.message });
            console.log(`Error inserting batch: ${err.message}`);
          }
        }
      })
      .on("end", async () => {
        try {
          // Insert any remaining members
          if (members.length > 0) {
            await Member.insertMany(members);
          }

          if (errors.length > 0) {
            console.log("Errors encountered:", errors);
            res.status(400).json({ message: "Some members could not be added", errors });
          } else {
            res.status(201).json({ message: "Members added successfully" });
          }
        } catch (err) {
          errors.push({ error: "Error inserting remaining members", details: err.message });
          console.log("Final insertion error:", err.message);
          res.status(500).json({ message: "An error occurred during the final insertion.", errors });
        }
      })
      .on("error", (err) => {
        console.log("Stream error occurred:", err);
        res.status(500).json({ message: "An error occurred during file processing." });
      });
  } catch (error) {
    console.log("Error occurred:", error);
    res.status(500).json({ message: error.message });
  }
}

export {
  addMember,
  editMember,
  getMember,
  getAllMembers,
  deleteMember,
  getMemberByPosOrYear,
  importCSVData,
};
