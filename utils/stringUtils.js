const replaceAll = (str, find, replace) => {
  return str.split(find).join(replace);
};

const normalize = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

module.exports = {
  replaceAll,
  normalize,
};
