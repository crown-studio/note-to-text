const { isSameMonth, parse } = require("date-fns");
const { regexMaster } = require("./contants/regexConstants");
const { readFile, writeFile, exists } = require("./fileSystemService");
const path = require("path");
const { currencyParseFloat } = require("../utils/currencyUtils");

const getValuesByRegex = (filePath) => {
  try {
    // /(?<=HISTÓRICO VALOR\n)(.+\n)+/gm
    // /(?<=SALDO ANTERIOR\s.+\n)(.+\n)+/gm
    const [extract] = readFile(filePath).match(/(?<=Extrato\n)(.+\n)+/gm);
    return extract;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const calcularValor = (valores) => {
  return valores.reduce((acc, { value }) => acc + value, 0).toFixed(2);
};

const listarJuros = (valores) => {
  return valores
    .filter(({ id }) => id === "000000")
    .filter(({ value }) => value > 0);
};

const calcularJuros = (valores) => {
  return calcularValor(listarJuros(valores));
};

const listarEntradas = (valores, strict) => {
  const result = valores
    .filter(({ id }) => id !== "000000")
    .filter(({ value }) => value > 0);
  if (!strict) return result;
  return result
    .filter(({ desc }) => desc !== "DP DIN LOT")
    .filter(({ desc }) => desc !== "CRED PIX");
};

const listarDepositos = (valores) => {
  return listarEntradas(valores).filter(({ desc }) => desc === "DP DIN LOT");
};

const listarCredPix = (valores) => {
  return listarEntradas(valores).filter(({ desc }) => desc === "CRED PIX");
};

const listarEnvioPix = (valores) => {
  return listarSaidas(valores).filter(({ desc }) => desc === "ENVIO PIX");
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

const verificarCaixa = (filePath, activeDate) => {
  const extract = getValuesByRegex(filePath);

  const saldoRgx = /Saldo\s*\r?(.*)/g;
  const [, initialValue] = saldoRgx.exec(extract);
  let finalValue = null;
  while ((match = saldoRgx.exec(extract)) !== null) {
    finalValue = match[1];
  }

  const initial = currencyParseFloat(initialValue);
  const final = currencyParseFloat(finalValue);

  const valores = listarTudo(filePath, activeDate);
  const saidas = parseFloat(calcularSaidas(valores));
  const juros = parseFloat(calcularJuros(valores));
  const entradas = parseFloat(calcularEntradas(valores));

  const result = Number((entradas + juros + saidas + initial).toFixed(2));

  return [result === final, initial, final];
};

const totalDeTransacoes = (valores) => valores?.length;

const hasValidEntry = (parsedDate, id, desc, parsedValue, parsedBalance) => {
  return !parsedDate ||
    !id ||
    !desc ||
    typeof parsedValue !== "number" ||
    typeof parsedBalance !== "number"
    ? false
    : true;
};

const listarTudo = (filePath, activeDate) => {
  const folderName = path.dirname(filePath);

  if (exists(`${folderName}/data.json`))
    return JSON.parse(readFile(`${folderName}/data.json`));

  const valores = getValuesByRegex(filePath);
  const dados = valores
    .split("Saldo")
    .filter((v) => v)
    .map((v) => v.replace(/\n/g, " "))
    .map((v) => v.trim())
    .map((v) => {
      // const [match, date, id, desc, value, type] = v.match(regexMaster) || []; // V2
      const [match, balance, typeBalance, desc, date, id, value, type] =
        v.match(regexMaster) || []; // V3

      if (!match) return null;

      const parsedBalance = currencyParseFloat(balance || "");
      const parsedValue = currencyParseFloat(value || "");
      const parsedDate = date?.replace(/\s/g, "");

      if (hasValidEntry(parsedDate, id, desc, parsedValue, balance))
        return null;

      return {
        id,
        desc,
        date: parsedDate,
        balance: typeBalance === "D" ? parsedBalance * -1 : parsedBalance,
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
    });

  writeFile(`${folderName}/data.json`, JSON.stringify(dados, null, 1));
  return dados;
};

const getResume = (pathToRead, pathToSave, activeDate) => {
  const entries = listarTudo(pathToRead, activeDate);
  const [check, initial, final] = verificarCaixa(pathToRead, activeDate);

  // console.log(entries);

  writeFile(
    pathToSave,
    `
    INICIAL:    ${initial}
    JUROS:      ${calcularJuros(entries)}
    ENTRADAS:   ${calcularEntradas(entries)}
    SAIDAS:     ${calcularSaidas(entries)}
    BALANÇO:    ${calcularValor(entries)}
    FINAL:      ${final}
    
    TRANSAÇÕES: ${totalDeTransacoes(entries)}
    VERIFICADO: ${check ? "PASS" : "FAIL"}
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
  listarDepositos,
  listarEnvioPix,
  listarCredPix,
  calcularValor,
};
