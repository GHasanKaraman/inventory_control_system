const express = require("express");
const upload = require("../file");

const router = express.Router();
//database models
const qrLogModel = require("../models/qrLog");
const productModel = require("../models/product");
const technicianModel = require("../models/technician");
const labelModel = require("../models/label");
const locationModel = require("../models/location");
const rackModel = require("../models/rack");
const vendorModel = require("../models/vendor");

router.post("/qr", async (req, res) => {
  try {
    const { id } = req.body;
    const product = await productModel.findById(id);
    const host = req.protocol + "://" + req.get("host");

    if (product) {
      product.image = host + "/" + product.image;
      const techs = await technicianModel.find({});
      if (techs) {
        res.json({
          result: "success",
          resultData: product,
          records: { ...techs },
        });
        console.log("Retrieved technicians!");
      } else {
        res.json({ result: "failed", resultData: "technicians_retrieve" });
        console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve technicians!");
      }
    } else {
      res.json({ result: "failed", resultData: "product_not_found" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/qr/give", async (req, res) => {
  try {
    let {
      _id,
      count,
      parts,
      technician,
      wanted_count,
      price,
      new_location,
      target,
    } = req.body;

    target = target.toUpperCase();

    const result = await qrLogModel.create({
      itemID: _id,
      count,
      parts,
      technician,
      wanted_count,
      source: new_location,
      target,
    });
    if (result._id) {
      const productResult = await productModel.updateOne(
        { _id: _id },
        {
          count: count - wanted_count,
          total_price: ((count - wanted_count) * price).toFixed(2),
        }
      );

      res.json(
        result._id && productResult.modifiedCount != 0
          ? { result: "success", resultData: result }
          : { result: "failed" }
      );
      console.log(
        technician +
          " took " +
          wanted_count +
          " out of " +
          count +
          " " +
          parts +
          " from " +
          new_location +
          " to " +
          target +
          "!"
      );
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/qr/rack", async (req, res) => {
  try {
    const { _id } = req.body;
    const labels = await labelModel.find({});
    const vendors = await vendorModel.find({});
    const locs = await locationModel.find({});
    const racks = await rackModel.find({ _id: _id });
    if (labels && locs && racks) {
      res.json({
        status: "success",
        labels: labels,
        locations: locs,
        racks: racks,
        vendors: vendors,
      });
      console.log("Retrieved datas!");
    } else {
      res.json({ status: "failed" });
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve datas!");
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/qr/rack/add", upload.single("file"), async (req, res) => {
  try {
    let { count, from_where, min_quantity, new_location, parts, price, tags } =
      req.body;

    price = essentials.numberFormatToEU(price);
    const image = req.file.path;

    const result = await productModel.create({
      image,
      count,
      from_where,
      min_quantity,
      new_location,
      parts,
      price: price.toFixed(2),
      tags,
      total_price: (price * count).toFixed(2),
    });

    if (result._id) {
      console.log(req.socket.remoteAddress + " added " + parts + " product!");
      res.json({ result: "success", resultData: result });
    } else {
      res.json({ result: "failed" });
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

module.exports = router;
