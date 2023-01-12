const fs = require("fs");

const readFolder = (folderPath) => {
  return fs.readdirSync(folderPath);
};

function readFile(src, encode = "utf-8") {
  return fs.readFileSync(src, encode);
}

function writeFile(src, value) {
  fs.writeFileSync(src, value);
}

function exists(src) {
  return fs.existsSync(src);
}

module.exports = {
  readFolder,
  readFile,
  writeFile,
  exists,
};
