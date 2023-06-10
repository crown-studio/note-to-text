const Tesseract = require("tesseract.js");
const { writeFile, readFolder } = require("./fileSystemService");
const { OEM } = require("tesseract.js");
const { getProgressBar, PROGRESS_TYPES } = require("./progressBarService");
const { createWorker } = Tesseract;

const startWorker = async (worker, lang = "eng", oem = OEM.DEFAULT) => {
  await worker.load();
  await worker.loadLanguage(lang);
  await worker.initialize(lang, oem);
};

const stopWorker = async (worker) => {
  await worker.terminate();
};

const progressUpdate = ({ progress, bar }) => {
  bar.update(Number(Math.floor(progress * 100)));
};

const recognizeDocument = async (path, lang, oem, bar) => {
  const worker = createWorker({
    langPath: "services",
    logger: (params) => progressUpdate({ ...params, bar }),
  });

  await startWorker(worker, lang, oem);
  const { text } = (await worker.recognize(path)).data;
  await stopWorker(worker);
  return text;
};

const recognizeDocuments = async (folderPath, lang, oem, output) => {
  const validFormatRgx = /\.bmp|\.jpg|\.jpeg|\.png|\.pbm|\.webp/g;
  const filesName = readFolder(folderPath).filter((name) => name.match(validFormatRgx));

  const multibar = getProgressBar(PROGRESS_TYPES.MULTI);
  const result = await Promise.all(
    filesName.map(async (fileName) => {
      const progressBar = multibar.create(100, 0);
      progressBar.update(0, { filename: fileName });

      const path = `${folderPath}/${fileName}`;
      return recognizeDocument(path, lang, oem, progressBar);
    })
  );
  multibar.stop();

  result?.forEach((text, index) => {
    if (!text) return;
    const fileName = output || filesName[index].replace(".png", ".txt");
    writeFile(`${folderPath}/${fileName}`, text);
  });

  return result;
};

module.exports = {
  recognizeDocuments,
  recognizeDocument,
};
