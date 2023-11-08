const dateRegex = /\d{2}\/\d{2}\/\d{4}/g;
const balanceRegex = /(\d+\.{1}\d+,\s{0,1}\d+) (C|D)/g;
const valueRegex = /\d+\.{0,1}\d+,\s{0,1}\d+ (C|D)/g;
const valuesRegex = /.+\s\w\n/g;
const descRegex = /\s\D{2,}\s/g;
const idRegex = /\d{6}/g;

const regexMaster =
  /\s*(\d{0,3}\.?:?\d+,?\s*\d+)\s*(€|C|D)\s?\s*(\D{2,})\s*(\d{2}\s*\/\d{2}\s*\/\d{4})\s*(\d{6}|.)\s+(\d{0,3}\.?:?\d+,?\s*\d+)\s*(€|C|D)/; // V3
// V2 /\s*(\d{2}\s*\/\d{2}\s*\/\d{4})\s*(\d{6}|.)\s?\s*(\D{2,})\s+(\d{0,3}\.?:?\d+,?\s*\d+)\s*(€|C|D)/;
// V1 /(\d{0,3}\.?\s*\d{0,3}\,?\s*\d{0,3})\s*[C|D]*\s*(\d{2}\s*\/\d{2}\s*\/\d{4})\s*(\d{6}|.)\s?\s*(\D{2,})\s+(\d{0,3}\.?:?\d+,?\s*\d+)\s*(€|C|D)/;

module.exports = {
  dateRegex,
  balanceRegex,
  valueRegex,
  valuesRegex,
  descRegex,
  idRegex,
  regexMaster,
};
