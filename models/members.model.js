import { Schema as _Schema, model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const membersSchema = new _Schema({
  member_id: { type: String, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  position: { type: String, required: true },
  pos: { type: String, required: true },
  emails: {
    type: [{ type: String, required: true }],
    validate: [arrayLimit, '{PATH} requires at least one email.']
  },
  image: {
    data: Buffer,
    contentType: String
  },
  phoneNumbers: { type: [String], default: [] },
  facebookLink: { type: String, required: true },
  linkedinLink: { type: String, required: true },
  state: { type: String, default: "" },
  city: { type: String, default: "" },
  dateOfBirth: { type: Date },
  rollNo: { type: String, default: "" },
  phNo: { type: String, default: "" },
  team: { type: String, default: "" }, // Added team field
});

function arrayLimit(val) {
  return val.length > 0;
}

const Member = model("Member", membersSchema);
export default Member;


