const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  parts: { type: String, required: true },
  count: { type: Number, required: true },
  price: { type: String, required: true },
  total_price: { type: String, required: true },
  from_where: { type: String, required: true },
  min_quantity: { type: String, required: true },
  new_location: { type: String, required: true },
  tags: { type: String, default: "NTAG" },
  fishbowl: { type: String, required: true },
});

const product = mongoose.model("product", productSchema);

module.exports = product;