const express = require("express");
const router = express.Router();

const technicianModel = require("../models/technician");

router.post("/technician", async (req, res) => {
  const techs = await technicianModel.find({});
  if (techs) {
    res.json({
      status: "success",
      records: { ...techs },
    });
    console.log("Retrieved technicians!");
  } else {
    res.json({ status: "failed" });
    console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve technicians!");
  }
});

router.post("/technician/add", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await technicianModel.create({
      name: name.toUpperCase(),
    });
    res.json(
      result._id
        ? { result: "success", resultData: result }
        : { result: "failed" }
    );
    console.log("Technician " + name + " is written in the database");
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/technician/delete", async (req, res) => {
  try {
    const id = req.body.id;
    if (id) {
      const result = await technicianModel.deleteOne({ _id: id });
      if (result.deletedCount != 0) {
        res.json({ status: "success" });
        console.log("\x1b[32m%s\x1b[0m", "Technician deleted!");
      } else {
        res.json({ status: "failed" });
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the technician for deletion. ID of the technician is " +
            id
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for deletion!");
      res.json({ status: "request_error" });
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

router.post("/technician/update", async (req, res) => {
  try {
    const { _id, name } = req.body;

    if (_id) {
      const result = await technicianModel.updateOne(
        { _id: _id },
        { name: name.toUpperCase() }
      );
      if (result.modifiedCount != 0) {
        console.log("\x1b[32m%s\x1b[0m", "Technician updated!");
        res.json({ status: "success" });
      } else {
        res.json({ status: "failed" });

        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user[0].name +
            " didn't update the technician. ID of the technician is " +
            _id
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for updating!");
      res.json({ status: "request_error" });
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

module.exports = router;
