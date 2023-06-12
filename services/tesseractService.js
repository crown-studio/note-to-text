const Tesseract = require("tesseract.js");
const { OEM } = require("tesseract.js");
const { writeFile, readFolder } = require("./fileSystemService");
const { getProgressBar, PROGRESS_TYPES, getProgressController } = require("./progressBarService");
const { createWorker, createScheduler } = Tesseract;
const validFormatRgx = /\.bmp|\.jpg|\.jpeg|\.png|\.pbm|\.webp/g;
const scheduler = createScheduler();

const saveResult = (result, folderPath, filesName, output) => {
  result?.forEach((text, index) => {
    if (!text) return;
    const fileName = output || filesName[index].replace(".png", ".txt");
    writeFile(`${folderPath}/${fileName}`, text);
  });
};

const startWorker = async (bar, lang = "eng", oem = OEM.DEFAULT) => {
  const worker = await createWorker({
    langPath: "services",
    logger: ({ progress, jobId }) => bar.update(jobId ? progress : 0),
  });
  await worker.loadLanguage(lang);
  await worker.initialize(lang, oem);
  return worker;
};

const stopWorker = async (worker) => {
  await worker.terminate();
};

const recognizeDocument = async (path, lang, oem, bar) => {
  const worker = await startWorker(bar, lang, oem);
  const { data } = await worker.recognize(path);
  await stopWorker(worker);
  return data.text;
};

const recognizeDocuments = async (folderPath, lang, oem, output) => {
  const filesName = readFolder(folderPath).filter((name) => name.match(validFormatRgx));
  const multibar = getProgressBar(PROGRESS_TYPES.MULTI);

  const result = await Promise.all(
    filesName.map(async (fileName) => {
      const progressBar = multibar.create(1, 0, { filename: fileName });
      const path = `${folderPath}/${fileName}`;
      return recognizeDocument(path, lang, oem, progressBar);
    })
  );

  multibar.stop();

  saveResult(result, folderPath, filesName, output);
  return result;
};

const progressUpdate = ({ progress, workerId, jobId, userJobId, status }, controller) => {
  console.log(workerId, jobId, userJobId);
  // if (!jobId) return;
  // controller.updateProgress(userJobId, progress);
};

const generateWorker = async (lang = "eng", oem = OEM.DEFAULT, controller) => {
  const worker = await createWorker({
    langPath: "services",
    logger: (params) => progressUpdate(params, controller),
  });
  await worker.loadLanguage(lang);
  await worker.initialize(lang, oem);
  scheduler.addWorker(worker);
};

const recognizeDocumentsBatch = async (instances, folderPath, lang, oem, output) => {
  const filesName = readFolder(folderPath).filter((name) => name.match(validFormatRgx));
  const controller = getProgressController();

  const workers = Array(instances).fill(generateWorker(lang, oem, controller));
  await Promise.all(workers);

  const result = await Promise.all(
    filesName.map(async (fileName) => {
      controller.registerFile(fileName);
      const path = `${folderPath}/${fileName}`;
      const { data } = await scheduler.addJob("recognize", path);
      return data?.text;
    })
  );

  controller.terminateAll();
  await scheduler.terminate(); // It also terminates all workers.

  saveResult(result, folderPath, filesName, output);

  return result;
};

module.exports = {
  recognizeDocument,
  recognizeDocuments,
  recognizeDocumentsBatch,
};
