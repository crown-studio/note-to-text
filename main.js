const {
  getResume,
  listarEntradas,
  listarTudo,
  listarSaidas,
  listarJuros,
  calcularSaidas,
  calcularJuros,
  calcularEntradas,
  listarDepositos,
  calcularValor,
  listarCredPix,
  listarEnvioPix,
} = require("./services/postProcessService");
const { recognizeDocuments } = require("./services/tesseractService");
const { parseMonth } = require("./utils/dateUtils");
const prompt = require("prompt");
const { readFile, exists, readFolder, extractZip } = require("./services/fileSystemService");
const { getImagesFromPDF, getTextFromPDF } = require("./services/pdfParseService");
const { format, subMonths } = require("date-fns");
const { OEM } = require("tesseract.js");
const { writeFile } = require("fs-extra");

const lang = "por";
const base = "./notas";
let ano = null;
let mes = null;
let folderPath = null;
let filePath = null;
let resultPath = null;
let activeDate = null;
const today = new Date();

const getParams = async () => {
  prompt.start();
  console.clear();

  try {
    console.log("\n\nINFORME A DATA PARA CONSULTA: \n");
    const result = await prompt.get(["ano", "mes"]);

    ano = result.ano || format(today, "yyyy");
    mes = result.mes || format(subMonths(today, 1), "MM");

    if (!parseMonth(mes)) return getParams();

    const { confirm } = await prompt.get({
      properties: {
        confirm: { message: `Consultando dados de ${parseMonth(mes).name}. de ${ano}. Deseja continuar? (Enter) Sim / (N) Não` },
      },
    });

    folderPath = `${base}/${ano}/${parseMonth(mes).name}`;
    filePath = `${folderPath}/nota.txt`;
    resultPath = `${folderPath}/result.txt`;
    activeDate = new Date(`${parseMonth(mes).number}/01/${ano}`);

    return confirm?.toUpperCase() === "N" ? getParams() : { ano, mes: parseMonth(mes).name };
  } catch (error) {
    console.log(error);
  }
};

const getNota = async (folderPath) => {
  const [fileName] = readFolder(folderPath).filter((names) => names.includes(`${parseMonth(mes).number} CAIXA_`));

  if (fileName.includes(".pdf")) await getTextFromPDF(fileName, folderPath);
  else await recognizeDocuments(folderPath, lang, OEM.TESSERACT_ONLY, "nota.txt");

  const data = JSON.stringify(listarTudo(filePath, activeDate), null, 1);
  writeFile(`${folderPath}/data.json`, data);
};

const extractData = async (recognize = false, override = false) => {
  console.clear();
  console.log(`\nEXTRAINDO DADOS: ${mes} ${ano}\n`);

  if (!exists(filePath) || recognize) await getNota(folderPath);
  if (!exists(resultPath) || override) getResume(filePath, resultPath, activeDate);
};

const extractDetails = async (folderPath, output, override = false) => {
  const filesName = readFolder(folderPath);
  const zipFile = filesName.find((name) => name.includes(".zip"));
  const path = `${folderPath}/${zipFile}`;
  const outputPath = `${folderPath}/${output}`;

  if (exists(outputPath) && !override) return;
  await extractZip(path, output);

  const files = readFolder(outputPath);
  await Promise.all(
    files
      .filter((name) => name.includes(".pdf"))
      .map(async (fileName) => {
        return getImagesFromPDF(`${outputPath}/${fileName}`, false);
      })
  );

  const data = require(`${folderPath}/data.json`);
  const result = await recognizeDocuments(outputPath, lang);

  result?.forEach((text) => {
    const descRgx = /Descrição\s*\r?\n(.*)/i;
    const valueRgx = /Valor\s*\r?\n(.*)/i;

    const [, desc] = descRgx.exec(text);
    const [, val] = valueRgx.exec(text);

    if (!desc || !val) return;
    data.forEach(({ value }, index) => {
      if ((value < 0 ? value * -1 : value) === parseFloat(val.replace(",", "."))) {
        data[index].msg = desc;
      }
    });

    writeFile(`${folderPath}/data.json`, JSON.stringify(data, null, 1));
  });
};

const printDate = () => {
  console.log(`\nDADOS DE ${parseMonth(mes).name}. DE ${ano}\n`);
};

const printOptions = () => {
  console.log("\n\nINFORME A OPERAÇÃO: \n");
  console.log("0 - SAIR");
  console.log("1 - EXTRAIR DADOS");
  console.log("2 - LISTAR SAIDAS");
  console.log("3 - LISTAR ENTRADAS");
  console.log("4 - LISTAR JUROS");
  console.log("5 - LISTAR TRANSAÇÕES");
  console.log("6 - EXIBIR RESUMO");
  console.log("7 - EXTRAIR DETALHES");
  console.log("8 - ALTERAR DATA\n\n");
};

const startMenu = async () => {
  prompt.start();
  console.clear();

  printOptions();

  try {
    const schema = {
      properties: {
        OP: {
          pattern: /[0-8]/,
          message: "Invalid option, check the menu above...",
          required: true,
        },
      },
    };

    const { OP } = await prompt.get(schema);

    printDate();

    switch (OP) {
      case "0":
        process.exit();
      case "1":
        await extractData(true, true);
        console.log("\nExtraido com sucesso!");
        break;
      case "2":
        const saidas = listarSaidas(listarTudo(filePath, activeDate));
        const enviopix = listarEnvioPix(saidas);
        console.log(saidas);
        console.log(`${enviopix.length} PIX: R$`, calcularValor(enviopix));
        console.log(`\nTotal de ${saidas.length} saidas: R$`, calcularSaidas(saidas));
        break;
      case "3":
        const entradas = listarEntradas(listarTudo(filePath, activeDate));
        const credpix = listarCredPix(entradas);
        const deposito = listarDepositos(entradas);
        const outras = listarEntradas(entradas, true);
        console.log(entradas);
        console.log(`${credpix.length} CREDPIX: R$`, calcularValor(credpix));
        console.log(`${deposito.length} DEPÓSITOS: R$`, calcularValor(deposito));
        console.log(`${outras.length} OUTROS: R$`, calcularValor(outras));
        console.log(`\nTotal de ${entradas.length} entradas: R$`, calcularEntradas(entradas));
        break;
      case "4":
        const juros = listarJuros(listarTudo(filePath, activeDate));
        console.log(juros);
        console.log("\nTotal de juros: R$", calcularJuros(juros));
        break;
      case "5":
        console.log(listarTudo(filePath, activeDate));
        break;
      case "6":
        getResume(filePath, resultPath, activeDate);
        console.log(readFile(resultPath));
        break;
      case "7":
        await extractDetails(folderPath, "UNZIPPED", true);
        console.log("\nExtraido com sucesso!");
        break;
      case "8":
        await getParams();
        await extractData();
        console.log(`\nData alterada para ${parseMonth(mes).name}. de ${ano}`);
        break;

      default:
        startMenu();
        break;
    }

    console.log("\n\n");
    await prompt.get({
      properties: {
        continue: { message: "Pressione enter para continuar" },
      },
    });

    await startMenu();
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await getParams();
  await extractData();
  await startMenu();
  // process.exit();
})();
