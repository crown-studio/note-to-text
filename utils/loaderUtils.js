const startDotsLoader = (timer) => {
  const template = ["", ".", "..", "..."];
  let counter = 0;

  const loader = setInterval(() => {
    console.clear();
    console.log(template[counter]);

    if (counter < template.length - 1) {
      counter++;
    } else {
      counter = 0;
    }
  }, timer);

  return loader;
};

const stopDotsLoader = (loader) => {
  clearInterval(loader);
  console.clear();
};

module.exports = { startDotsLoader, stopDotsLoader };
