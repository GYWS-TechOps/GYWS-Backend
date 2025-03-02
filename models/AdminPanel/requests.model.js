import pkg from 'mongoose';
const {Schema, model, models } = pkg;
// Members Schema
const requestSchema = new Schema({
  appliedBy : { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  emails: { type: [String], required: true },
  imageUrls: { type: [String], required : true },
  phoneNumbers: { type: [String], required : true },
  facebookLink: { type: String, required: true },
  linkedinLink: { type: String, required : true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required : true },
  dateOfBirth: { type: String, required: true },
  rollNo: { type: String, required: true },
  status:  { type: String , default: "Pending" , Enumerator : ["Pending" , "Accepted" , "Rejected" , "Commented"]},
  teams:{type : [String]},
  position: { type: String, required: true , Enumerator : ["JEM" , "SEM" , "HEAD" , "UGCOORDINATOR" , "GB"]},
  year : { type: Number , required: true },
  post : { type: String , required: false, Enumerator: ["PRESIDENT" , "VICE PRESIDENT" , "GENERAL SECRETARY", "ASSISTENT SECRETARY", "HUMAN RESOURCES MANAGER", "CHIEF EXECUTIVE OFFICER - LIGHT","CHIEF TECHNICAL OFFICER", "TREASURER", "SCHOOL DEVELOPMENT OFFICER", "CHIEF FUNDRAISING OFFICER" , "FOREIGN AND CORPORATE RELATION OFFICER" ,"DONOR ENGAGEMENT OFFICER" , "PUBLIC RELATION OFFICER"]},
  comments: [{
    name: { type: String, required: true },
    comment: { type: String, required: true }
  }],
});
//Export the model
export const Request = models.Requests || model('Requests', requestSchema);