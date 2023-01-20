const mongoose = require("mongoose");

const qrLogSchema = new mongoose.Schema({
  technician: { type: String, required: true },
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

const qrLog = mongoose.model("qrLog", qrLogSchema);

module.exports = qrLog;
