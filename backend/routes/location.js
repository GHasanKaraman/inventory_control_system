const express = require("express");
const router = express.Router();

const locationModel = require("../models/location");

router.post("/location", async (req, res) => {
  /*const locs = await locationModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "location",
          foreignField: "new_location",
          as: "matched_docs",
        },
      },
      {
        $match: {
          matched_docs: { $eq: [] },
        },
      },
    ]);*/
  const locs = await locationModel.find({});
  if (locs) {
    res.json({
      status: "success",
      records: { ...locs },
    });
    console.log("Retrieved locations!");
  } else {
    res.json({ status: "failed" });
    console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve locations!");
  }
});

router.post("/location/nonused", async (req, res) => {
  const locs = await locationModel.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "location",
        foreignField: "new_location",
        as: "matched_docs",
      },
    },
    {
      $match: {
        matched_docs: { $eq: [] },
      },
    },
  ]);

  if (locs) {
    res.json({
      status: "success",
      records: { ...locs },
    });
    console.log("Retrieved locations!");
  } else {
    res.json({ status: "failed" });
    console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve locations!");
  }
});

router.post("/location/add", async (req, res) => {
  try {
    const { location, rack } = req.body;
    const result = await locationModel.create({
      location: location.toUpperCase(),
      rack: rack.toUpperCase(),
    });
    res.json(
      result._id
        ? { result: "success", resultData: result }
        : { result: "failed" }
    );
    console.log("Location " + location + " is written in the database");
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/location/delete", async (req, res) => {
  try {
    const id = req.body.id;
    if (id) {
      const result = await locationModel.deleteOne({ _id: id });
      if (result.deletedCount != 0) {
        res.json({ status: "success" });
        console.log("\x1b[32m%s\x1b[0m", "Location deleted!");
      } else {
        res.json({ status: "failed" });
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the location for deletion. ID of the location is " + id
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Didn't get the reguest for deletion of location!"
      );
      res.json({ status: "request_error" });
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

router.post("/location/update", async (req, res) => {
  try {
    const { _id, location, rack } = req.body;

    if (_id) {
      const result = await locationModel.updateOne(
        { _id: _id },
        { location: location.toUpperCase(), rack: rack.toUpperCase() }
      );
      if (result.modifiedCount != 0) {
        console.log("\x1b[32m%s\x1b[0m", "Location updated!");
        res.json({ status: "success" });
      } else {
        res.json({ status: "failed" });

        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user[0].name +
            " didn't update the location. ID of the location is " +
            _id
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Didn't get the reguest for updating location!"
      );
      res.json({ status: "request_error" });
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

module.exports = router;
