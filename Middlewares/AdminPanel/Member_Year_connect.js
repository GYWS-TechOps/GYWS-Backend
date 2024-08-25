import mongoose from 'mongoose';
import Member from "../../models/AdminPanel/members.model.js"
import Year from '../../models/AdminPanel/years.model.js'; // Adjust the path as needed

async function updateYearsWithMemberTeams(memberId) {
    try {
        // Find the member by their ID
        const member = await Member.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        // console.log('Member found:', member);

        // Step 1: Remove member ID from all teams in the Years schema
        const teams = ['techops', 'light', 'rise', 'src', 'sponse', 'design', 'finance', 'media', 'coordinators', 'gbs'];

        await Year.updateMany(
            {},
            {
                $pull: teams.reduce((acc, team) => {
                    acc[team] = { member_id: memberId };
                    return acc;
                }, {})
            }
        );

        // console.log('Removed member from existing teams in years.');
        

        // Step 2: Update Years schema with the new teams from the member schema
        const memberTeams = member.teams;

        for (const teamData of memberTeams) {
            const { year, teamAndpos } = teamData;

            // console.log('Processing year:', year);
            // console.log('Teams data:', teamAndpos);

            // Find the year document or create a new one if it doesn't exist
            let yearDoc = await Year.findById(year);
            if (!yearDoc) {
                yearDoc = new Year({ _id: year });
                // console.log('Created new year document:', yearDoc);
            }
            // console.log("YearDoc after removing teams", yearDoc);

            // Ensure each team field is an array
            const teamFields = ['techops', 'light', 'rise', 'src', 'sponse', 'design', 'finance', 'media', 'coordinators', 'gbs'];
            teamFields.forEach(field => {
                if (!Array.isArray(yearDoc[field])) {
                    yearDoc[field] = [];
                }
            });

            // Iterate over each team position in the teamAndpos array
            for (const teamPos of teamAndpos) {
                const { team, pos, position } = teamPos;

                // Check if the team is a valid field in the Year schema
                if (yearDoc[team]) {
                    // Check if the member is already in the team
                    let memberInTeam = yearDoc[team].find(m => m.member_id.toString() === memberId.toString());

                    if (memberInTeam) {
                        // Update existing member's position and pos
                        memberInTeam.pos = pos;
                        memberInTeam.position = position;
                        // console.log(`Updated member data in team ${team}:`, memberInTeam);
                    } else {
                        // Add the member to the team if not already present
                        yearDoc[team].push({ member_id: memberId, pos, position });
                        // console.log(`Added new member to team ${team}:`, yearDoc[team]);
                    }
                } else {
                    console.error(`Team '${team}' is not a valid field in the Year schema.`);
                }
            }

            // Save the updated or new year document
            await yearDoc.save();
            // console.log('Saved year document:', yearDoc);
        }

        console.log('Years schema updated successfully');
    } catch (error) {
        console.error('Error updating Years schema:', error.message || error);
        throw error;
    }
}

export default updateYearsWithMemberTeams;
