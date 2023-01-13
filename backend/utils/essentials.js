const fs = require("fs");
const productModel = require("../models/product");
const numberFormatToEU = (number) => {
  number = number.replace(",", ".");
  return Number(number);
};

const deleteImage = async (id) => {
  try {
    const result = await productModel.find({ _id: id }, {});
    await fs.unlinkSync(result[0].image);
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

module.exports = { numberFormatToEU, deleteImage };
