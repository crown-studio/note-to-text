const currencyParseFloat = (value) => {
  if (typeof value !== "string") return value;
  return parseFloat(value.replace(/[\.\s]/g, "").replace(",", "."));
};

module.exports = {
  currencyParseFloat,
};
