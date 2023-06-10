const currencyParseFloat = (value) => {
  return parseFloat(value.replace(/[\.\s]/g, "").replace(",", "."));
};

module.exports = {
  currencyParseFloat,
};
