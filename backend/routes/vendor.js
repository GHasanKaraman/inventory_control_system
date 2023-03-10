const express = require("express");
const router = express.Router();

const vendorModel = require("../models/vendor");

router.post("/vendor", async (req, res) => {
  const vendors = await vendorModel.find({});
  if (vendors) {
    res.json({
      status: "success",
      records: { ...vendors },
    });
    console.log("Retrieved vendors!");
  } else {
    res.json({ status: "failed" });
    console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve vendors!");
  }
});

router.post("/vendor/add", async (req, res) => {
  try {
    const { vendor } = req.body;
    const result = await vendorModel.create({
      vendor: vendor.toUpperCase(),
    });
    res.json(
      result._id
        ? { result: "success", resultData: result }
        : { result: "failed" }
    );
    console.log("Vendor " + vendor + " is written in the database");
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/vendor/delete", async (req, res) => {
  try {
    const id = req.body.id;
    if (id) {
      const result = await vendorModel.deleteOne({ _id: id });
      if (result.deletedCount != 0) {
        res.json({ status: "success" });
        console.log("\x1b[32m%s\x1b[0m", "Vendor deleted!");
      } else {
        res.json({ status: "failed" });
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the vendor for deletion. ID of the vendor is " + id
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

router.post("/vendor/update", async (req, res) => {
  try {
    const { _id, vendor } = req.body;

    if (_id) {
      const result = await vendorModel.updateOne(
        { _id: _id },
        { vendor: vendor.toUpperCase() }
      );
      if (result.modifiedCount != 0) {
        console.log("\x1b[32m%s\x1b[0m", "Vendor updated!");
        res.json({ status: "success" });
      } else {
        res.json({ status: "failed" });

        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user[0].vendor +
            " didn't update the vendor. ID of the vendor is " +
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
