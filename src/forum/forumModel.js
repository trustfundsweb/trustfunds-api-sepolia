const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  name: {
    type: String,
    required: true,
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Campaign"
  },
  date: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const forumModel = mongoose.model("Forum", forumSchema);

module.exports = forumModel;
