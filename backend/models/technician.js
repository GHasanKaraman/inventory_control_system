const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const technician = mongoose.model("technician", technicianSchema);

module.exports = technician;
