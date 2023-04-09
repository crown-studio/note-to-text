const { isSameMonth, parse } = require("date-fns");
const { regexMaster } = require("./contants/regexConstants");
const { readFile, writeFile } = require("./fileSystemService");

const calcularValor = (valores) => {
  return valores.reduce((acc, { value }) => acc + value, 0).toFixed(2);
};

const listarJuros = (valores) => {
  return valores.filter(({ id }) => id === "000000").filter(({ value }) => value > 0);
};

const calcularJuros = (valores) => {
  return calcularValor(listarJuros(valores));
};

const listarEntradas = (valores) => {
  return (
    valores
      .filter(({ id }) => id !== "000000")
      // .filter(({ desc }) => desc !== "DP DIN LOT")
      .filter(({ value }) => value > 0)
  );
};

const calcularEntradas = (valores) => {
  return calcularValor(listarEntradas(valores));
};

const listarSaidas = (valores) => {
  return valores.filter(({ value }) => value < 0);
};

const calcularSaidas = (valores) => {
  return calcularValor(listarSaidas(valores));
};

const totalDeTransacoes = (valores) => valores?.length;

const listarTudo = (path, activeDate) => {
  const [valores] = readFile(path).match(/(?<=HISTÓRICO VALOR\n)(.+\n)+/gm);
  return (
    valores
      .split("Saldo")
      .filter((v) => v)
      .map((v) => v.replace("\n", " "))
      .map((v) => {
        const [match, date, id, desc, value, type] = v.match(regexMaster) || [];
        // console.log(match);
        const parsedValue = parseFloat(value?.replace(".", "")?.replace(",", "."));
        const parsedDate = date?.replace(/\s/g, "");

        if (!parsedDate || !id || !desc || typeof parsedValue !== "number") return null;

        return {
          date: parsedDate,
          id,
          desc,
          value: type === "D" ? parsedValue * -1 : parsedValue,
        };
      })
      // .filter(({ id }) => id)
      .filter((v) => v)
      .filter((elem, index, self) => index === self.indexOf(elem))
      .filter(({ date }) => {
        if (!activeDate) return true;
        const [day, month, year] = date.split("/");
        return isSameMonth(new Date(`${month}/${day}/${year}`), activeDate);
      })
  );
};

const getResume = (pathToRead, pathToSave, activeDate) => {
  const entries = listarTudo(pathToRead, activeDate);

  // console.log(entries);

  writeFile(
    pathToSave,
    `
    JUROS:      ${calcularJuros(entries)}
    ENTRADAS:   ${calcularEntradas(entries)}
    SAIDAS:     ${calcularSaidas(entries)}
    TOTAL:      ${calcularValor(entries)}
    TRANSAÇÕES: ${totalDeTransacoes(entries)}

    VERIFICADO: FALSE
    `
  );
};

module.exports = {
  getResume,
  listarTudo,
  calcularEntradas,
  calcularSaidas,
  calcularJuros,
  listarEntradas,
  listarSaidas,
  listarJuros,
};
