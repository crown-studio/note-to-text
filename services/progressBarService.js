const cliProgress = require("cli-progress");

const defaultSinglebarOptions = { clearOnComplete: false, format: " {bar} | {filename} | {value}%" };
const defaultMultibarOptions = { clearOnComplete: false, hideCursor: true, format: " {bar} | {filename} | {value}%" };

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

module.exports = {
  PROGRESS_TYPES,
  getProgressBar,
};
