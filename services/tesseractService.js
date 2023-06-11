const Tesseract = require("tesseract.js");
const { writeFile, readFolder } = require("./fileSystemService");
const { OEM } = require("tesseract.js");
const { getProgressBar, PROGRESS_TYPES } = require("./progressBarService");
// const { startDotsLoader, stopDotsLoader } = require("../utils/loaderUtils");
const { createWorker, createScheduler } = Tesseract;
const scheduler = createScheduler();

const startWorker = async (worker, lang = "eng", oem = OEM.DEFAULT) => {
  // await worker.load();
  await worker.loadLanguage(lang);
  await worker.initialize(lang, oem);
};

const stopWorker = async (worker) => {
  await worker.terminate();
};

const recognizeDocument = async (path, lang, oem, bar) => {
  const worker = await createWorker({
    langPath: "services",
    logger: ({ progress }) => bar.update(progress),
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

const getProgressController = () => {
  const multibar = getProgressBar(PROGRESS_TYPES.MULTI);
  const files = [];
  const bars = {};
  let pointer = 0;

  const registerJob = (id, progress = 0) => {
    // console.log(id);
    bars[id] = multibar.create(1, progress, { filename: files[pointer] });
    pointer++;
  };

  const registerFile = (fileName) => {
    files.push(fileName);
  };

  const updateProgress = (id, progress) => {
    if (bars[id]) {
      // console.log(id);
      bars[id].update(progress);
    } else {
      registerJob(id, progress);
    }
  };

  const terminate = () => {
    multibar.stop();
  };

  return { updateProgress, registerFile, registerJob, terminate };
};

const progressUpdate = ({ progress, workerId, jobId, userJobId, status }, controller) => {
  // console.log(jobId, userJobId);
  if (!jobId) return;
  controller.updateProgress(userJobId, progress);
};

const workerGen = async (lang = "eng", oem = OEM.DEFAULT, controller) => {
  const worker = await createWorker({
    langPath: "services",
    logger: (params) => progressUpdate(params, controller),
  });
  await worker.loadLanguage(lang);
  await worker.initialize(lang, oem);
  scheduler.addWorker(worker);
};

const batchRecognizeDocuments = async (instances, folderPath, lang, oem, output) => {
  const validFormatRgx = /\.bmp|\.jpg|\.jpeg|\.png|\.pbm|\.webp/g;
  const filesName = readFolder(folderPath).filter((name) => name.match(validFormatRgx));

  const controller = getProgressController();

  // console.log(controller);

  const workers = Array(instances).fill(workerGen(lang, oem, controller));
  await Promise.all(workers);

  const results = await Promise.all(
    filesName.map(async (fileName) => {
      // const progressBar = multibar.create(100, 0, { filename: fileName });
      // await progressBar.update(100, { filename: fileName });
      controller.registerFile(fileName);
      const path = `${folderPath}/${fileName}`;
      const { data } = await scheduler.addJob("recognize", path);

      return data.text;
    })
  );

  controller.terminate();
  await scheduler.terminate(); // It also terminates all workers.

  return results;
};

module.exports = {
  recognizeDocuments,
  recognizeDocument,
  batchRecognizeDocuments,
};
