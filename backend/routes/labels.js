const express = require("express");
const router = express.Router();

const labelModel = require("../models/label");

router.post("/", async (req, res) => {
  let labels = await labelModel.find({});
  if (labels) {
    res.json({
      status: "success",
      records: { ...labels },
    });
    console.log("Retrieved labels!");
  } else {
    res.json({ status: "failed" });
    console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve labels!");
  }
});

router.post("/add", async (req, res) => {
  try {
    const { label, color } = req.body;
    const result = await labelModel.create({
      name: label.toString().toUpperCase(),
      color,
    });
    res.json(
      result._id
        ? { result: "success", resultData: result }
        : { result: "failed" }
    );
    console.log(label + " is written in the database");
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/delete", async (req, res) => {
  try {
    const id = req.body.id;
    if (id) {
      const result = await labelModel.deleteOne({ _id: id });
      if (result.deletedCount != 0) {
        res.json({ status: "success" });
        console.log("\x1b[32m%s\x1b[0m", "Label deleted!");
      } else {
        res.json({ status: "failed" });
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the label for deletion. ID of the label is " + id
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

router.post("/update", async (req, res) => {
  try {
    const { _id, name, color } = req.body;

    if (_id) {
      const result = await labelModel.updateOne(
        { _id: _id },
        { name: name.toUpperCase(), color: color }
      );
      if (result.modifiedCount != 0) {
        console.log("\x1b[32m%s\x1b[0m", "Label updated!");
        res.json({ status: "success" });
      } else {
        res.json({ status: "failed" });

        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user[0].name +
            " didn't update the label. ID of the label is " +
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
