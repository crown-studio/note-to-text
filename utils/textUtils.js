const {
  readFile,
  readFolder,
  writeFile,
} = require("../services/fileSystemService");

// async function convertANSIToUTF8(file) {
//   // Lê o conteúdo do arquivo como um ArrayBuffer
//   const fileBuffer = await file.arrayBuffer();

//   // Decodifica o ArrayBuffer do formato ANSI para UTF-8
//   const decoder = new TextDecoder("windows-1252");
//   const decodedText = decoder.decode(fileBuffer);

//   // Codifica o texto decodificado de volta para UTF-8
//   const encoder = new TextEncoder();
//   const encodedText = encoder.encode(decodedText);

//   return encodedText;
// }

async function ansiToUtf8(filePath) {
  const file = readFile(filePath, "latin1");
  if (!file) return;
  writeFile(filePath, file, "utf8");
  console.log(`Encode successfully converted! ${filePath}`);
}

const ansiToUtf8All = async (folderPath) => {
  const filesName = readFolder(folderPath).filter((fileName) =>
    fileName.includes(".csv")
  );
  filesName.forEach((filePath) => {
    ansiToUtf8(`${folderPath}/${filePath}`);
  });
};

module.exports = {
  ansiToUtf8,
  ansiToUtf8All,
};
