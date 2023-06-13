const waitFor = (msec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${msec * 100} seconds`);
    }, msec);
  });
};

module.exports = {
  waitFor,
};
