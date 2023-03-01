const express = require("express");
const router = express.Router();

const rackModel = require("../models/rack");

router.post("/rack", async (req, res) => {
  const racks = await rackModel.find({});
  if (racks) {
    res.json({
      status: "success",
      records: { ...racks },
    });
    console.log("Retrieved racks!");
  } else {
    res.json({ status: "failed" });
    console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve racks!");
  }
});

router.post("/rack/add", async (req, res) => {
  try {
    const { rack } = req.body;
    const result = await rackModel.create({
      rack: rack.toUpperCase(),
    });
    res.json(
      result._id
        ? { result: "success", resultData: result }
        : { result: "failed" }
    );
    console.log("Rack " + rack + " is written in the database");
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/rack/delete", async (req, res) => {
  try {
    const id = req.body.id;
    if (id) {
      const result = await rackModel.deleteOne({ _id: id });
      if (result.deletedCount != 0) {
        res.json({ status: "success" });
        console.log("\x1b[32m%s\x1b[0m", "Rack deleted!");
      } else {
        res.json({ status: "failed" });
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the rack for deletion. ID of the rack is " + id
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Didn't get the reguest for deletion of rack!"
      );
      res.json({ status: "request_error" });
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

router.post("/rack/update", async (req, res) => {
  try {
    const { _id, rack } = req.body;

    if (_id) {
      const result = await rackModel.updateOne(
        { _id: _id },
        { rack: rack.toUpperCase() }
      );
      if (result.modifiedCount != 0) {
        console.log("\x1b[32m%s\x1b[0m", "Rack updated!");
        res.json({ status: "success" });
      } else {
        res.json({ status: "failed" });

        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user[0].name + " didn't update the rack. ID of the rack is " + _id
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Didn't get the reguest for updating rack!"
      );
      res.json({ status: "request_error" });
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

module.exports = router;
