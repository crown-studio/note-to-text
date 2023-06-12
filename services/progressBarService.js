const cliProgress = require("cli-progress");

const defaultSinglebarOptions = { clearOnComplete: false, format: " {bar} | {filename} | {percentage}%" };
const defaultMultibarOptions = { clearOnComplete: false, hideCursor: true, format: " {bar} | {filename} | {percentage}%" };

const PROGRESS_TYPES = {
  SINGLE: "singlebar",
  MULTI: "multibar",
};

const { SINGLE, MULTI } = PROGRESS_TYPES;

const getProgressBar = (type = SINGLE, options) => {
  if (type === MULTI) {
    return new cliProgress.MultiBar(
      {
        ...defaultMultibarOptions,
        ...options,
      },
      cliProgress.Presets.shades_classic
    );
  }

  return new cliProgress.SingleBar({ ...defaultSinglebarOptions, ...options }, cliProgress.Presets.shades_classic);
};

const getProgressController = () => {
  const multibar = getProgressBar(PROGRESS_TYPES.MULTI);
  const files = [];
  const bars = {};
  let pointer = 0;

  const registerJob = (id, progress = 0) => {
    bars[id] = multibar.create(1, progress, { filename: files[pointer] });
    pointer++;
  };

  const registerFile = (fileName) => {
    if (!fileName) return;
    files.push(fileName);
  };

  const updateProgress = (id, progress) => {
    if (bars[id]) {
      bars[id].update(progress);
    } else {
      registerJob(id, progress);
    }
  };

  const terminateAll = () => {
    multibar.stop();
    pointer = 0;
  };

  return { updateProgress, registerFile, terminateAll };
};

module.exports = {
  PROGRESS_TYPES,
  getProgressBar,
  getProgressController,
};
