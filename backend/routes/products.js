const express = require("express");
const router = express.Router();
const upload = require("../file");
const productModel = require("../models/product");
const essentials = require("../utils/essentials");

router.post("/items", upload.single("file"), async (req, res) => {
  try {
    let {
      count,
      from_where,
      min_quantity,
      new_location,
      parts,
      price,
      tags,
      status,
    } = req.body;

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
      status,
    });

    if (result._id) {
      console.log(req.user[0].name + " added " + parts + " product!");
      res.json({ result: "success", resultData: result });
    } else {
      res.json({ result: "failed" });
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

router.post("/order", async (req, res) => {
  console.log("Request to orders list ..");
  const products = await productModel.find(
    { status: { $ne: "INVENTORY" } },
    {}
  );

  const host = req.protocol + "://" + req.get("host");
  for (let i = 0; i < products.length; i++) {
    products[i].image = host + "/" + products[i].image;
  }

  res.json({
    status: "success",
    records: { ...products },
  });
});

router.post("/order/step-up", async (req, res) => {
  try {
    const { _id, status } = req.body;
    const result = await productModel.updateOne(
      { _id: _id },
      { status: status }
    );
    if (result.modifiedCount != 0) {
      console.log(req.user[0].name + " stepped up " + _id + " to " + status);
      res.json({ result: "success" });
    } else {
      res.json({ result: "failed" });
      console.log("Nothing changed about stepping up!");
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

router.post("/order/transfer", async (req, res) => {
  try {
    const { id, values } = req.body;
    const result = await productModel.updateOne(
      { _id: id },
      { ...values, status: "INVENTORY" }
    );
    console.log({ ...values, status: "INVENTORY" });
    if (result.modifiedCount != 0) {
      console.log(req.user[0].name + " transfered the order");
      res.json({ result: "success" });
    } else {
      console.log("Something went wrong while transfering the order!");
      res.json({ result: "failed" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

module.exports = router;
