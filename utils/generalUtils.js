const waitFor = (msec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${msec * 100} seconds`);
    }, msec);
  });
};

const folderBack = (path, levels = 1) => {
  return path.replace("./", new Array(levels).fill("../").join(""));
};

module.exports = {
  waitFor,
  folderBack,
};
