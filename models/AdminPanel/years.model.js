import pkg from "mongoose";
const { Schema: _Schema, model, models } = pkg;

const YearsSchema = new _Schema({
  _id: { type: Number }, // Use year as the _id
  techops: [{ member_id: String, pos: String, position: String }],
  light: [{ member_id: String, pos: String, position: String }],
  rise: [{ member_id: String, pos: String, position: String }],
  src: [{ member_id: String, pos: String, position: String }],
  sponse: [{ member_id: String, pos: String, position: String }],
  design: [{ member_id: String, pos: String, position: String }],
  finance: [{ member_id: String, pos: String, position: String }],
  media: [{ member_id: String, pos: String, position: String }],
  coordinators: [{ member_id: String, pos: String, position: String }],
  gbs: [{ member_id: String, pos: String, position: String }],
}, { _id: false }); // Disable the default _id field

const Years = models.Years || model("Years", YearsSchema);

// YearsSchema.pre('save', async function (next) {
//   const yearDoc = this;
//   const Member = models.Member;

//   const updateMemberTeams = async (teamName, members) => {
//     await Promise.all(members.map(async (member) => {
//       const { member_id, pos, position } = member;
//       const memberDoc = await Member.findOne({ member_id });

//       if (memberDoc) {
//         let teamEntry = memberDoc.teams.find(entry => entry.year.toString() === yearDoc.year.toString());

//         if (!teamEntry) {
//           teamEntry = { year: yearDoc._id, teamAndpos: [] };
//           memberDoc.teams.push(teamEntry);
//         }

//         const existingTeam = teamEntry.teamAndpos.find(tp => tp.team === teamName);

//         if (existingTeam) {
//           existingTeam.pos = pos;
//           existingTeam.position = position;
//         } else {
//           teamEntry.teamAndpos.push({ team: teamName, pos, position });
//         }

//         await memberDoc.save();
//       }
//     }));
//   };

//   await Promise.all(Object.keys(yearDoc.toObject()).map(async (teamName) => {
//     if (Array.isArray(yearDoc[teamName])) {
//       await updateMemberTeams(teamName, yearDoc[teamName]);
//     }
//   }));

//   next();
// });

// YearsSchema.pre('findOneAndUpdate', async function (next) {
//   const update = this.getUpdate();
//   const Member = models.Member;

//   const updateMemberTeams = async (teamName, members) => {
//     await Promise.all(members.map(async (member) => {
//       const { member_id, pos, position } = member;
//       const memberDoc = await Member.findOne({ member_id });

//       if (memberDoc) {
//         let teamEntry = memberDoc.teams.find(entry => entry.year.toString() === this._conditions.year.toString());

//         if (!teamEntry) {
//           teamEntry = { year: this._conditions.year, teamAndpos: [] };
//           memberDoc.teams.push(teamEntry);
//         }

//         const existingTeam = teamEntry.teamAndpos.find(tp => tp.team === teamName);

//         if (existingTeam) {
//           existingTeam.pos = pos;
//           existingTeam.position = position;
//         } else {
//           teamEntry.teamAndpos.push({ team: teamName, pos, position });
//         }

//         await memberDoc.save();
//       }
//     }));
//   };

//   await Promise.all(Object.keys(update).map(async (teamName) => {
//     if (Array.isArray(update[teamName])) {
//       await updateMemberTeams(teamName, update[teamName]);
//     }
//   }));

//   next();
// });

export default Years;
