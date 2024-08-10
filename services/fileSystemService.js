const fs = require("fs");
const fsx = require("fs-extra");
const jszip = require("jszip");
const path = require("path");
const copyPaste = require("copy-paste");

const readFolder = (folderPath) => {
  return fs.readdirSync(folderPath);
};

function readFile(src, encode = "utf-8") {
  return fs.readFileSync(src, { encoding: encode });
}

function writeFile(src, value, encode = "utf-8") {
  fs.writeFileSync(src, value, { encoding: encode });
}

function appendFile(src, value, encode = "utf-8") {
  const filePath = path.resolve(__dirname, src);
  if (!exists(filePath)) return;
  const fd = fs.openSync(filePath, "a");
  fs.writeFileSync(fd, value, { encoding: encode });
  fs.closeSync(fd);
}

function exists(src) {
  return fs.existsSync(src);
}

async function readZip(src) {
  const data = fs.readFileSync(src);
  const zip = await jszip.loadAsync(data);
  const files = Object.values(zip.files).filter((file) => !file.dir);
  return files;
}

async function extractZip(filePath, folderName) {
  const files = await readZip(filePath);
  const folderPath = path.dirname(filePath);

  await Promise.all(
    files.map(async (file) => {
      const content = await file.async("nodebuffer");
      const fileName = path.basename(file.name);
      const output = `${folderPath}/${
        folderName ? folderName + "/" + fileName : file.name
      }`;
      await fsx.outputFile(output, content);
    })
  ).catch((err) => {
    console.log(err);
  });
}

function copyText(text, message = "Text copied to clipboard") {
  if (!text || typeof text !== "string") return;
  copyPaste.copy(text, () => {
    console.info(message);
  });
}

const createFolder = (folderPath) => {
  if (exists(folderPath)) return;
  fs.mkdirSync(folderPath, { recursive: true });
};

module.exports = {
  readFolder,
  readFile,
  writeFile,
  appendFile,
  createFolder,
  exists,
  readZip,
  extractZip,
  copyText,
};
