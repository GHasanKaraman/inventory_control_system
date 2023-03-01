const express = require("express");
const router = express.Router();

const userModel = require("../models/user");
const technicianLogModel = require("../models/technicianLog");
const qrLogModel = require("../models/qrLog");

router.post("/logs/technicians", async (req, res) => {
  let logs = await technicianLogModel.find({});
  if (logs) {
    let users = await userModel.find({});
    if (users) {
      res.json({
        status: "success",
        records: { logs: logs, users: users },
      });
      console.log("Retrieved technicians logs!");
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve infos!");
    }
  } else {
    res.json({ status: "failed" });
    console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve technician logs!");
  }
});

router.post("/logs/qr", async (req, res) => {
  let logs = await qrLogModel.find({});
  if (logs) {
    res.json({
      status: "success",
      records: { logs: logs },
    });
    console.log("Retrieved QR logs!");
  } else {
    res.json({ status: "failed" });
    console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve QR logs!");
  }
});

module.exports = router;
