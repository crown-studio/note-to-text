const {
  getResume,
  listarEntradas,
  listarTudo,
  listarSaidas,
  listarJuros,
  calcularSaidas,
  calcularJuros,
  calcularEntradas,
} = require("./services/postProcessService");
const { recognizeDocuments } = require("./services/tesseractService");
const { parseMonth } = require("./utils/dateUtils");
const prompt = require("prompt");
const { readFile, exists, readFolder } = require("./services/fileSystemService");
const { extractFromPDF, extractDetails } = require("./services/pdfParseService");
const { format, subMonths } = require("date-fns");

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

  if (fileName.includes(".pdf")) await extractFromPDF(fileName, folderPath);
  else await recognizeDocuments(lang, folderPath);
};

const extractData = async (recognize = false, override = false) => {
  console.clear();
  console.log(`\nEXTRAINDO DADOS: ${mes} ${ano}\n`);

  if (!exists(filePath) || recognize) await getNota(folderPath);
  if (!exists(resultPath) || override) getResume(filePath, resultPath, activeDate);

  // console.log(readFile(resultPath));
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
    const { OP } = await prompt.get(["OP"]);

    printDate();

    switch (OP) {
      case "0":
        process.exit();
      case "1":
        extractData(true, true);
        break;
      case "2":
        const saidas = listarSaidas(listarTudo(filePath, activeDate));
        console.log(saidas);
        console.log(`\nTotal de ${saidas.length} saidas: R$`, calcularSaidas(saidas));
        break;
      case "3":
        const entradas = listarEntradas(listarTudo(filePath, activeDate));
        console.log(entradas);
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
        extractDetails(folderPath, "UNZIPPED");
        // getResume(filePath, resultPath, activeDate);
        // console.log(readFile(resultPath));
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
