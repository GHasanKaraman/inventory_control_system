const mongoose = require("mongoose");

const technicianLogSchema = new mongoose.Schema({
  technician: { type: String, required: true },
  userID: { type: mongoose.Types.ObjectId, required: true },
  createdAt: { type: Date, default: () => new Date(), required: true },
  itemID: { type: mongoose.Types.ObjectId, required: true },
  parts: { type: String, required: true },
  count: { type: Number, required: true },
  wanted_count: { type: Number, required: true },
});

const technicianLog = mongoose.model("technicianLog", technicianLogSchema);

module.exports = technicianLog;
