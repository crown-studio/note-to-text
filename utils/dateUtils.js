const parseMonth = (value) => {
  switch (value?.toUpperCase()) {
    case "JANEIRO":
    case "JAN":
    case "01":
    case "1":
      return { name: "JAN", number: "01" };
    case "FEVEREIRO":
    case "FEV":
    case "02":
    case "2":
      return { name: "FEV", number: "02" };
    case "MARÇO":
    case "MARCO":
    case "MAR":
    case "03":
    case "3":
      return { name: "MAR", number: "03" };
    case "ABRIL":
    case "ABR":
    case "04":
    case "4":
      return { name: "ABR", number: "04" };
    case "MAIO":
    case "MAI":
    case "05":
    case "5":
      return { name: "MAI", number: "05" };
    case "JUNHO":
    case "JUN":
    case "06":
    case "6":
      return { name: "JUN", number: "06" };
    case "JULHO":
    case "JUL":
    case "07":
    case "7":
      return { name: "JUL", number: "07" };
    case "AGOSTO":
    case "AGO":
    case "08":
    case "8":
      return { name: "AGO", number: "08" };
    case "SETEMBRO":
    case "SET":
    case "09":
    case "9":
      return { name: "SET", number: "09" };
    case "OUTUBRO":
    case "OUT":
    case "10":
      return { name: "OUT", number: "10" };
    case "NOVEMBRO":
    case "NOV":
    case "11":
      return { name: "NOV", number: "11" };
    case "DEZEMBRO":
    case "DEZ":
    case "12":
      return { name: "DEZ", number: "12" };
    default:
      return null;
      break;
  }
};

module.exports = {
  parseMonth,
};
