//https://gerenciador.caixa.gov.br/empresa/dashboard/pix/extrato

// OBS: save the files in ANSI (Windows-1252)

async function getCSV(limit, filter) {
  const FILTROS = {
    ENTRADA: "Recebido",
    SAIDA: "Enviado",
  };

  const waitFor = (msec) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`${msec / 1000} seconds`);
      }, msec);
    });
  };

  const getElements = async () => {
    const query = [];
    const rows = Array.from(
      document.querySelectorAll(
        ".tabela-lancamentos table tbody tr:not(.detalhes)"
      )
    ).filter((el) =>
      filter
        ? el.querySelector("td:nth-child(4)").innerText.includes(filter)
        : el
    );

    limit = limit && limit < rows.length ? limit : rows.length;
    for (let i = 0; i < limit; i++) {
      rows[i]?.click();
      await waitFor(2000);
      const elem = document.querySelector(
        ".tabela-lancamentos table tbody #div-transacao.div-linha"
      );
      query.push(elem);
    }

    const elements = await Promise.all(query);
    return elements;
  };

  const getValues = () => {
    try {
      const data = require("./data.json");
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const getOnlineInfo = (element) => {
    const dest = element?.querySelector(
      ".bloco:nth-child(3) > dl > dd"
    )?.innerText;
    const orig = element?.querySelector(
      ".bloco:nth-child(2) > dl > dd"
    )?.innerText;
    const date = element?.querySelector(
      ".bloco:nth-child(1) > dl > dd:nth-child(6)"
    )?.innerText;
    const value = element?.querySelector(
      ".bloco:nth-child(1) > dl > dd:nth-child(8)"
    )?.innerText;
    const desc = element?.querySelector(
      ".bloco:nth-child(1) > dl > dd:nth-child(12)"
    )?.innerText;

    return { dest, orig, date, value, desc };
  };

  const getLocalInfo = ({ date, value, msg, ...rest }) => {
    const dest = "Dest";
    const orig = "Orig";
    const desc = msg || rest.desc;

    return { dest, orig, date, value, desc };
  };

  const formatValue = (value) => {
    if (typeof value === "number") return value;
    return parseFloat(
      value
        .replace("R$", "")
        .replace(/[\.\s]/g, "")
        .replace(",", ".")
    );
  };

  const formatDate = (value) => value.slice(0, 10);

  const formatName = (value) => {
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const format = (arr) => {
    if (filter === FILTROS.SAIDA) {
      return arr.reduce(
        (csv, { dest, date, value, desc }) =>
          csv.concat(
            `${desc},${formatValue(value)},${formatDate(
              date
            )},Outros,Outros,Caixa Econômica Federal,,** @import ?? @${dest} **,\n`
          ),
        "Descrição,Valor,Vencimento,Categoria,Subcategoria,Conta,Cartão,Observações\n"
      );
    } else if (filter === FILTROS.ENTRADA) {
      return arr.reduce(
        (csv, { orig, date, value, desc }) =>
          csv.concat(
            `${formatName(orig)},${formatValue(value)},${formatDate(
              date
            )},Dízimo,Outros,Caixa Econômica Federal,,** @import ?? ** ${desc},\n`
          ),
        "Descrição,Valor,Vencimento,Categoria,Subcategoria,Conta,Cartão,Observações\n"
      );
    }
  };

  return typeof process !== "undefined" &&
    process.release.name.search(/node|io.js/) !== -1
    ? format(getValues().map(getLocalInfo))
    : format((await getElements()).map(getOnlineInfo));
}

const despesas = getCSV(null, "Enviado");
const receitas = getCSV(null, "Recebido");

Promise.all([despesas, receitas]).then((values) => {
  const [despesas, receitas] = values;

  // Copia o resultado para a área de transferência
  const tempInput = document.createElement("input");
  tempInput.value = `${despesas}\n${receitas}`;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  console.log(despesas, receitas);
});
