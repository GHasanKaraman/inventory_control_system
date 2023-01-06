const numberFormatToEU = (number) => {
  number = number.replace(",", ".");
  return Number(number);
};

module.exports = { numberFormatToEU };
