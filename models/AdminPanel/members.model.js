import pkg from "mongoose";
const { Schema: _Schema, model, models } = pkg;


const membersSchema = new _Schema({
  _id: { type: String }, // Use member_id as the default _id
  firstName: { type: String, required: true },
  lastName: {type: String},
  emails: { type: [String], required: true },
  imageUrls: { type: [String], default: [] },
  phoneNumbers: { type: [String], default: [] },
  facebookLink: { type: String, default: "" },
  linkedinLink: { type: String, default: "" },
  state: { type: String, default: "" },
  city: { type: String, default: "" },
  dateOfBirth: { type: Date },
  rollNo: { type: String, default: "" },
  teams: [
    {
      teamAndpos: [
        {
          team: String,
          pos: String,
          position: String,
        },
      ],
      year: {
        type: Number, // Use year as a Number
        ref: 'Years',
      },
    },
  ],
},{_id:false});

//middleware to copy data to Years document automatically, when member is ad
membersSchema.pre('save', async function (next) {
  try {
    const member = this; // Reference to the current member document being saved
    const Years = model('Years'); // Reference to the Years model

    // Iterate over each team entry in the member's teams array
    for (const teamEntry of member.teams) {
      const { teamAndpos, year } = teamEntry;

      // Find the year document by year number (which is now the _id)
      let yearDoc = await Years.findById(year);

      if (!yearDoc) {
        // Create a new year document if it doesn't exist
        yearDoc = new Years({ _id: year });
        await yearDoc.save();
      }

      // Update the teamEntry with the year _id
      teamEntry.year = yearDoc._id;

      // Prepare updates for the Year document
      const updates = {
        $set: {}, // For updating existing entries
        $addToSet: {}, // For adding new entries
      };

      // Iterate over each team position in the teamAndpos array
      for (const teamPos of teamAndpos) {
        const { team, pos, position } = teamPos;
        const teamPath = `${team}`; // Path to the team in the Year document

        // Check if the member already exists in the team for the given year
        const existingMemberIndex = yearDoc[team]?.findIndex(m => m.member_id === member._id);

        if (existingMemberIndex > -1) {
          // Update existing member's position and pos
          updates.$set[`${teamPath}.${existingMemberIndex}.pos`] = pos;
          updates.$set[`${teamPath}.${existingMemberIndex}.position`] = position;
        } else {
          // Add new member to the team
          updates.$addToSet[teamPath] = { member_id: member._id, pos, position };
        }
      }

      // Update the Year document once for all team positions
      await Years.updateOne({ _id: yearDoc._id }, updates, { upsert: true });
    }

    // Ensure the transformed teams array is applied to the save operation
    member.teams = member.teams.map(teamEntry => ({
      ...teamEntry,
      year: teamEntry.year // Ensure year is set as ObjectId
    }));

    next(); // Proceed to the next middleware
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
});



membersSchema.pre('findOneAndDelete', async function(next) {
  const memberId = this.getQuery()._id;
  const Years = model('Years')
  // Iterate over all fields in the Years schema
  const teams = ['techops', 'light', 'rise', 'src', 'sponse', 'design', 'finance', 'media', 'coordinators', 'gbs'];

  try {
    // Loop through all years and remove the member ID from each team
    await Years.updateMany(
      {},
      {
        $pull: teams.reduce((acc, team) => {
          acc[team] = { member_id: memberId };
          return acc;
        }, {})
      }
    );

    next();
  } catch (err) {
    next(err);
  }
});

const Member = models.Member || model("Member", membersSchema);

export default Member;
