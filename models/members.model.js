import { Schema as _Schema, model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const membersSchema = new _Schema({
  member_id: { type: String, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  position: { type: String, required: true },
  pos: {type : String, required: true},
  imageUrl: { type: String, required: true },
  facebookLink: { type: String, required: true },
  linkedinLink: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  year: {type: String, required: true},
}
);

const Member = model("Member", membersSchema);
export default Member;
