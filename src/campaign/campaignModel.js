const mongoose = require("mongoose");

const causesList = [
  "Medical",
  "Artistic",
  "Humanitarian",
  "Environmental",
  "Mental Health",
  "Disaster Relief",
  "Entrepreneurship",
  "Sports Development",
  "Research & Education",
  "Other",
];

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  story: {
    type: [String],
    required: true,
  },
  goal: {
    type: Number,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  creatorAddress: {
    type: String,
    required: true
  },
  causeType: {
    type: String,
    enum: causesList,
    default: "Other",
    required: true,
  },
  milestones: [
    {
      description: {
        type: String,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
      funds: {
        type: Number,
        required: true,
      },
    },
  ],
});

const campaignModel = mongoose.model("Campaign", campaignSchema);

module.exports = {
  campaignModel,
  causesList,
};
