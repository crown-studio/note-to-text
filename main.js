const { getResume, listarEntradas, listarTudo, listarSaidas, listarJuros } = require("./services/postProcessService");
const { recognizeDocuments } = require("./services/tesseractService");
const { parseMonth } = require("./utils/dateUtils");
const prompt = require("prompt");
const { readFile, exists } = require("./services/fileSystemService");

const lang = "por";
const base = "./notas";
let ano = null;
let mes = null;
let folderPath = null;
let filePath = null;
let resultPath = null;
let activeDate = null;

const getParams = async () => {
  prompt.start();
  console.clear();

  try {
    console.log("\n\nINFORME A DATA PARA CONSULTA: \n");
    const result = await prompt.get(["ano", "mes"]);

    ano = result.ano;
    mes = result.mes;

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

const extractData = async (recognize = false, override = false) => {
  console.clear();
  console.log(`\nEXTRAINDO DADOS: ${mes} ${ano}\n`);

  if (!exists(filePath) || recognize) await recognizeDocuments(lang, folderPath);
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
  console.log("7 - ALTERAR DATA\n\n");
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
        // console.clear();
        console.log(listarSaidas(listarTudo(filePath, activeDate)));
        break;
      case "3":
        // console.clear();
        console.log(listarEntradas(listarTudo(filePath, activeDate)));
        break;
      case "4":
        // console.clear();
        console.log(listarJuros(listarTudo(filePath, activeDate)));
        break;
      case "5":
        // console.clear();
        console.log(listarTudo(filePath, activeDate));
        break;
      case "6":
        // console.clear();
        getResume(filePath, resultPath, activeDate);
        console.log(readFile(resultPath));
        break;
      case "7":
        // console.clear();
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
    console.log(err);
  }
};

(async () => {
  await getParams();
  await extractData();
  await startMenu();
  // process.exit();
})();
