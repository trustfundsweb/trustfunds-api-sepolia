const mongoose = require("mongoose");

const connectDb = async (url) => {
  try {
    if (!url) throw new Error("Please provide a valid mongo uri!");
    await mongoose.connect(url);
    console.log("connected to mongodb...");
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDb;
