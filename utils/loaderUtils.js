const startDotsLoader = (timer) => {
  const template = ["", ".", "..", "..."];
  let counter = 0;

  const loader = setInterval(() => {
    if (counter > template.length) {
      counter = 0;
    } else {
      counter++;
    }
    console.clear();
    console.log(template[counter]);
  }, timer);

  return loader;
};

const stopDotsLoader = (loader) => {
  clearInterval(loader);
};

module.exports = { startDotsLoader, stopDotsLoader };
