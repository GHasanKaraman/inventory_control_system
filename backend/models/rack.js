const mongoose = require("mongoose");

const rackSchema = new mongoose.Schema({
  rack: { type: String, required: true },
});

const rack = mongoose.model("rack", rackSchema);

module.exports = rack;
