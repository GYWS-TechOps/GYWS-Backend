import { Schema as _Schema, model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const membersSchema = new _Schema({
  member_id: { type: String, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  position: { type: String, required: true },
  pos: { type: String, required: true },
  imageUrl: { type: String },
  email:{type:String, unique: true},
  otherEmails:{type:[String], default:[""]},
  phoneNumbers: { type: [String], default: [""] },
  facebookLink: { type: String, required: true },
  linkedinLink: { type: String, required: true },
  state: { type: String, default: "" },
  city: { type: String, default: "" },
  dateOfBirth: { type: Date },
  rollNo: { type: String, default: "" },
  team: { type: String, default: "" },
  year: { type: String, required: true }
});



const Member = model("Member", membersSchema);
export default Member;
