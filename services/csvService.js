const fs = require("fs");
const { normalize } = require("../utils/stringUtils");
const { readFile, readFolder, writeFile } = require("./fileSystemService");
const { parse } = require("csv");
const copyPaste = require("copy-paste");

const csvToJson = (inputPath, outputPath) => {
  const records = [];

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
  });

  const transformHeader = (key) => {
    if (key === "efetivação") return "pagamento";
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

    writeFile(outputPath, `${JSON.stringify(result, null, "\t")}`);

    console.log("\n\nFile writed successfully!");
  });

  parser.write(readFile(inputPath));
  parser.end();
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

const formatCoraCSV = async (folderPath) => {
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

      const csvString = [...receitas, ...despesas]
        .map((row) => Object.values(row).join(","))
        .join("\n");

      copyPaste.copy(csvString, () => {
        console.log("Text copied to clipboard");
      });

      // console.log(formattedData);
    });
};

module.exports = {
  csvToJson,
  csvToJsonAll,
  formatCoraCSV,
};
