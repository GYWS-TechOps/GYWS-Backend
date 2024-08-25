import Member from "../../models/AdminPanel/members.model.js";

const addTeamData = (existingTeams, newTeams) => {
  const updatedTeams = [...existingTeams];

  newTeams.forEach((newTeam) => {
    // Ensure the year is treated as a number
    const newTeamYear = Number(newTeam.year);
    const existingTeamIndex = updatedTeams.findIndex((team) => Number(team.year) === newTeamYear);

    if (existingTeamIndex !== -1) {
      // Merge and deduplicate teamAndpos within the same year
      const existingTeamAndpos = updatedTeams[existingTeamIndex].teamAndpos;
      const mergedTeamAndpos = [
        ...existingTeamAndpos,
        ...newTeam.teamAndpos.filter(
          (newPos) =>
            !existingTeamAndpos.some(
              (existingPos) =>
                existingPos.team === newPos.team &&
                existingPos.pos === newPos.pos &&
                existingPos.position === newPos.position
            )
        ),
      ];

      // Remove duplicates from mergedTeamAndpos
      const uniqueTeamAndpos = mergedTeamAndpos.filter(
        (pos, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.team === pos.team &&
              p.pos === pos.pos &&
              p.position === pos.position
          )
      );

      // Update the team with the merged and deduplicated teamAndpos
      updatedTeams[existingTeamIndex].teamAndpos = uniqueTeamAndpos;
    } else {
      // If the year does not exist, add the new team
      updatedTeams.push({ ...newTeam, year: newTeamYear });
    }
  });

  console.log("Updated Teams :", updatedTeams);
  return updatedTeams;
};

export { addTeamData };
