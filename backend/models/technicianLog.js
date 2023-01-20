const mongoose = require("mongoose");

const technicianLogSchema = new mongoose.Schema({
  technician: { type: String, required: true },
  userID: { type: mongoose.Types.ObjectId, required: true },
  createdAt: {
    type: Date,
    default: () => {
      var d = new Date();
      d.setHours(d.getHours() - 5);
      return d;
    },
    required: true,
  },
  itemID: { type: mongoose.Types.ObjectId, required: true },
  parts: { type: String, required: true },
  count: { type: Number, required: true },
  wanted_count: { type: Number, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
});

const technicianLog = mongoose.model("technicianLog", technicianLogSchema);

module.exports = technicianLog;
