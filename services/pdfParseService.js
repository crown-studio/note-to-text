const fs = require("fs");
const PDFParser = require("pdf-parse");
const { replaceAll } = require("../utils/stringUtils");
const { writeFile, readFolder, extractZip, exists } = require("./fileSystemService");
const pdf2img = require("pdf-img-convert");

async function parseImages(filePath) {
  const content = await pdf2img.convert(filePath);
  content.forEach((image) => {
    fs.writeFile(filePath.replace(".pdf", ".png"), image, function (error) {
      if (error) {
        console.error("Error: " + error);
      }
    });
  });
  console.log("Images successfully parsed!");
}

const renderPage = (pageData) => {
  const renderOptions = {
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  };

  return pageData.getTextContent(renderOptions).then(function ({ items }) {
    let lastY,
      lastX,
      text = "";

    items.forEach(({ str, transform: [scaleX, angleX, angleY, scaleY, posX, posY] }) => {
      if (lastY == posY || !lastY) {
        if (posX - lastX < 50) text += str;
        else text += " " + str;
      } else {
        text += "\n" + str;
      }
      lastY = posY;
      lastX = posX;
    });

    return text;
  });
};

const parseText = async (data, options) => {
  return await PDFParser(data, options);
};

const extractFromPDF = async (fileName, folderPath) => {
  const file = fs.readFileSync(`${folderPath}/${fileName}`);
  const data = await parseText(file, { pagerender: renderPage });
  writeFile(`${folderPath}/nota.txt`, replaceAll(data.text, "\n Extrato\n", ""));
};

const extractDetails = async (folderPath, output) => {
  const filesName = readFolder(folderPath);
  const zipFile = filesName.find((name) => name.includes(".zip"));
  const path = `${folderPath}/${zipFile}`;
  const outputPath = `${folderPath}/${output}`;

  if (exists(outputPath)) return;
  await extractZip(path, output);

  const files = readFolder(outputPath);
  files.forEach(async (fileName) => {
    await parseImages(`${outputPath}/${fileName}`);
  });
};

module.exports = {
  extractFromPDF,
  extractDetails,
};
