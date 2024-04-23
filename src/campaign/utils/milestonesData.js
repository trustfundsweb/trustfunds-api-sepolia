function getMilestoneData(milestones) {
  const deadlines = [];
  const completionPercentages = [];

  milestones.forEach((milestone) => {
    deadlines.push(new Date(milestone.date).getTime());
    completionPercentages.push((milestone.funds / 100) * 100); // Assuming completion percentage is calculated based on funds
  });

  return {
    deadlines,
    completionPercentages,
  };
}

module.exports = { getMilestoneData };
