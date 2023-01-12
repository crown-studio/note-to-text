const Tesseract = require("tesseract.js");
const { writeFile, readFolder } = require("./fileSystemService");
const cliProgress = require("cli-progress");
const { OEM } = require("tesseract.js");
const { createWorker } = Tesseract;

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const worker = createWorker({
  langPath: "services",
  logger: ({ progress }) => {
    progressBar.update(progress);
  },
});

const recognizeDocument = async (lang, path) => {
  progressBar.start(1, 0);
  await worker.load();
  await worker.loadLanguage(lang);
  await worker.initialize(lang, OEM.TESSERACT_ONLY);
  const {
    data: { text },
  } = await worker.recognize(path);
  await worker.terminate();
  progressBar.stop();
  return text;
};

const recognizeDocuments = async (lang, folderPath) => {
  const filesName = readFolder(folderPath);

  const result = await Promise.all(
    filesName
      .filter((name) => name.match(/\.bmp|\.jpg|\.jpeg|\.png|\.pbm|\.webp/g))
      .map(async (fileName) => {
        const path = `${folderPath}/${fileName}`;
        const text = await recognizeDocument(lang, path);
        return text;
      })
  );

  result?.forEach((text, index) => {
    if (!text) return;
    writeFile(`${folderPath}/nota.txt`, text);
  });
};

module.exports = {
  recognizeDocuments,
  recognizeDocument,
};
