const fs = require("fs");
const PDFParser = require("pdf-parse");
const { replaceAll } = require("../utils/stringUtils");
const { writeFile } = require("./fileSystemService");
const pdf2img = require("pdf-img-convert");
const { getProgressBar } = require("./progressBarService");

async function parseImages(filePath, verbose = true) {
  const content = await pdf2img.convert(filePath);
  content.forEach((image) => {
    fs.writeFile(filePath.replace(".pdf", ".png"), image, function (error) {
      if (error) {
        console.error("Error: " + error);
      }
    });
  });
  if (!verbose) return;
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

const getTextFromPDF = async (fileName, folderPath) => {
  const singlebar = getProgressBar();
  singlebar.start(100, 0, { filename: fileName });
  const file = fs.readFileSync(`${folderPath}/${fileName}`);
  const data = await parseText(file, { pagerender: renderPage });
  writeFile(`${folderPath}/nota.txt`, replaceAll(data.text, "\n Extrato\n", ""));
  singlebar.update(100);
  singlebar.stop();
};

module.exports = {
  getTextFromPDF,
  getImagesFromPDF: parseImages,
};
