const fs = require("fs");
const PDFParser = require("pdf-parse");
const { replaceAll } = require("../utils/stringUtils");
const { writeFile } = require("./fileSystemService");

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
      // str === "X" ||
      // str === "TO" ||
      // str === "Ó" ||
      // str === "RICO" ||
      // str === "OT" ||
      // str === "TERIOR" ||
      // str === "í" ||
      // str === "odo" ||
      // str === "atoLE" ||
      // str === "os" ||
      // str === "ato" ||
      // str === "eis."

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

const options = {
  pagerender: renderPage,
};

const extractFromPDF = async (fileName, folderPath) => {
  const pdfData = fs.readFileSync(`${folderPath}/${fileName}`);
  const data = await PDFParser(pdfData, options);

  writeFile(`${folderPath}/nota.txt`, replaceAll(data.text, "\n Extrato\n", ""));
};

module.exports = {
  extractFromPDF,
};
