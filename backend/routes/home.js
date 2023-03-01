const express = require("express");
const upload = require("../file");
const productModel = require("../models/product");
const essentials = require("../utils/essentials");

const router = express.Router();

router.post("/home", async (req, res) => {
  console.log("Request to loading table...");
  const products = await productModel.find({ status: "INVENTORY" }, {});

  const host = req.protocol + "://" + req.get("host");
  for (let i = 0; i < products.length; i++) {
    products[i].image = host + "/" + products[i].image;
  }

  res.json({
    status: "success",
    records: { ...products },
    user: { ...req.user },
  });
});

router.post("/home/delete", async (req, res) => {
  try {
    const id = req.body.id;
    if (id && (await essentials.deleteImage(id)) == 1) {
      const result = await productModel.deleteOne({ _id: id });
      if (result.deletedCount != 0) {
        res.json({ status: "success" });
        console.log("\x1b[32m%s\x1b[0m", "Item deleted!");
      } else {
        res.json({ status: "failed" });
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the item for deletion. ID of the item is " + id
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

router.post("/home/update", upload.single("file"), async (req, res) => {
  try {
    let {
      id,
      count,
      from_where,
      min_quantity,
      new_location,
      parts,
      price,
      tags,
    } = req.body;

    price = essentials.numberFormatToEU(price);
    from_where = from_where.toUpperCase();
    new_location = new_location.toUpperCase();
    parts = parts.toUpperCase();

    const pipeline = {
      count,
      from_where,
      min_quantity,
      new_location,
      parts,
      price: price.toFixed(2),
      tags,
      total_price: (price * count).toFixed(2),
    };
    if (req.file) {
      pipeline.image = req.file.path;
    }

    const isImageInPipeline = async () => {
      if (pipeline.image) {
        if ((await essentials.deleteImage(id)) == 1) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    };

    if (isImageInPipeline() && id) {
      const result = await productModel.updateOne({ _id: id }, pipeline);
      if (result.modifiedCount != 0) {
        console.log("\x1b[32m%s\x1b[0m", "Item updated!");
        res.json({ status: "success" });
      } else {
        res.json({ status: "failed" });

        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user[0].name + " didn't update the item. ID of the item is " + id
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

router.post("/home/give", async (req, res) => {
  try {
    let {
      id,
      count,
      parts,
      technician,
      wanted_count,
      price,
      new_location,
      target,
    } = req.body;
    price = essentials.numberFormatToEU(price);
    target = target.toUpperCase();
    const result = await technicianLogModel.create({
      itemID: id,
      userID: req.user[0]._id,
      count,
      parts,
      technician,
      wanted_count,
      source: new_location,
      target,
    });
    if (result._id) {
      const productResult = await productModel.updateOne(
        { _id: id },
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
        req.user[0].name +
          " gave " +
          wanted_count +
          " out of " +
          count +
          " " +
          parts +
          " to " +
          technician +
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

module.exports = router;
