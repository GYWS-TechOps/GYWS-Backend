import mongoose from "mongoose";
import Member from "../models/members.model.js";
import { v4 as uuidv4 } from "uuid";

//Add Member
async function addMember(req, res) {
  try {
    const {
      name,
      position,
      pos,
      emails, 
      facebookLink,
      linkedinLink,
      year,
      phoneNumbers, 
      state,
      city,
      dateOfBirth,
      rollNo,
      phNo,
      team // Added team field
    } = req.body;

    // Check if a member with the same primary email already exists
    const existingMember = await Member.findOne({ "emails.0": emails[0] });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "Member with this primary email already exists" });
    }

    // Process the image file if it exists in the request
    let image = null;
    if (req.file) {
      image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    // Generate a unique member_id based on the year, pos, and primary email
    const member_id = `${year}-${pos}-${emails[0]}` || uuidv4();

    const newMember = new Member({
      member_id,
      name,
      position,
      pos,
      emails,
      image,
      facebookLink,
      linkedinLink,
      phoneNumbers,
      state,
      city,
      dateOfBirth,
      rollNo,
      phNo,
      year,
      team // Added team field
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function editMember(req, res) {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    // Check if the id is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

    // Process the image file if it exists in the request
    if (req.file) {
      updatedData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
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
      return res.status(404).json({ message: 'Member not found' });
    }

    res
      .status(200)
      .json({ message: 'Member updated successfully', member: updatedMember });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to update member', error: error.message });
  }
}





// Get Member
async function getMember(req, res) {
  try {
    const { member_id, pos } = req.query;

    const query = {};
    if (member_id) query.member_id = member_id;
    if (email) query.email = email;

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
    const { year, position } = req.query;

    const query = {};
    if (year) query.year = year;
    if (position) query.position = position;

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

export {
  addMember,
  editMember,
  getMember,
  getAllMembers,
  deleteMember,
  getMemberByPosOrYear,
};
