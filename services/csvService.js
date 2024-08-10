const fs = require("fs");
const path = require("path");
const { normalize } = require("../utils/stringUtils");
const {
  readFile,
  readFolder,
  writeFile,
  copyText,
} = require("./fileSystemService");
const { parse } = require("csv");
const { CSV_HEADER_TEMPLATE } = require("../constants/general");

const csvToJson = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const records = [];
    const results = [];

    const parser = parse({
      delimiter: ",",
      relax_quotes: true,
      relax_column_count: true,
    });

    parser.on("readable", function () {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on("error", function (err) {
      console.error(err.message);
      reject(err);
    });

    const transformHeader = (key) => {
      if (key === "efetivacao") return "pagamento";
      return key;
    };

    const transformValue = (key, value) => {
      if (key === "Valor" && inputPath.includes("Despesa"))
        return Number(value) * -1;
      if (key === "Valor") return Number(value);
      if (key === "Encargos") return Number(value) * -1;
      return value;
    };

    parser.on("end", function () {
      const [headers, ...rows] = records;

      const result = rows.map((row) => {
        return Object.fromEntries(
          headers.map((header, index) => [
            transformHeader(normalize(header)),
            transformValue(header, row[index]),
          ])
        );
      });

      results.push(...result);
      resolve(results);

      if (!outputPath) return;
      writeFile(outputPath, `${JSON.stringify(result, null, "\t")}`);
      console.log("\n\nArquivo escrito com sucesso!");
    });

    parser.write(readFile(inputPath));
    parser.end();
  });
};

const csvToJsonMerge = async (folderPath, fileName) => {
  const files = readFolder(folderPath).filter(
    (fileName) => path.extname(fileName) === ".csv"
  );

  const data = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    data.push(...(await csvToJson(filePath)));
    // `${folderPath}/temp/${file}`.replace(".csv", ".json") // use as output path if needed
  }

  writeFile(`${folderPath}/${fileName}.json`, JSON.stringify(data, null, 2));
  return data;
};

const csvToJsonAll = async (folderPath) => {
  try {
    const filesName = readFolder(folderPath).filter((fileName) =>
      fileName.includes(".csv")
    );
    filesName.forEach((filePath) =>
      csvToJson(
        `${folderPath}/${filePath}`,
        `${folderPath}/${filePath.slice(0, filePath.indexOf("."))}.json`
      )
    );
  } catch (error) {
    console.log(`\n${error.message}`);
  }
};

const formatCoraCSV = async (folderPath, outputPath) => {
  const [csvFileName] = readFolder(folderPath).filter((fileName) =>
    fileName.includes(".csv")
  );

  const filePath = `${folderPath}/${csvFileName}`;
  const formattedData = [];

  fs.createReadStream(filePath)
    .pipe(parse({ columns: true }))
    .on("data", (row) => {
      const { Data, Transação, Identificação, Valor } = row;

      const formattedRow = {
        Descrição: Identificação,
        Valor: Valor.replace("-", ""),
        Vencimento: Data,
        Categoria: "Outros",
        Subcategoria: "Outros",
        Conta: "Cora",
        Cartão: "",
        Observações: `** @import ?? ** ${Transação} ${row["Tipo Transação"]}`,
      };

      formattedData.push(formattedRow);
    })
    .on("end", () => {
      const receitas = formattedData.filter((row) =>
        row.Observações.includes("CRÉDITO")
      );
      const despesas = formattedData.filter((row) =>
        row.Observações.includes("DÉBITO")
      );

      const toCSV = (arr) => {
        return arr.map((row) => Object.values(row).join(",")).join("\n");
      };

      if (!outputPath) return copyText(toCSV([...receitas, ...despesas]));

      writeFile(
        `${outputPath}_RECE_IMPORT.csv`,
        `${CSV_HEADER_TEMPLATE}${toCSV(receitas)}`
      );
      writeFile(
        `${outputPath}_DESP_IMPORT.csv`,
        `${CSV_HEADER_TEMPLATE}${toCSV(despesas)}`
      );
      // console.log(formattedData);
    });
};

module.exports = {
  csvToJson,
  csvToJsonAll,
  csvToJsonMerge,
  formatCoraCSV,
};
