const fs = require("fs");
const filename = "FamilyFeud_Questions.json";

const jsonResult = {};

const questionRegexp = /^\d+\s(.*?\D+)$/;
const optionRegexp = /^(.*?)\s[(]*(\d+)[)]*$/;

try {
  const file = fs.readFileSync("../data/raw", { encoding: "utf8", flag: "r" });
  const lines = file.split(/\r?\n/);
  let question;
  lines.forEach((line) => {
    if (line.trim().length === 0) return;
    if (questionRegexp.test(line)) {
      console.log(line.match(questionRegexp));
      question = line.match(questionRegexp)[1];
      jsonResult[question] = [];
      return;
    }
    if (optionRegexp.test(line)) {
      const [_, option, mark] = line.match(optionRegexp);
      jsonResult[question].push([option, mark]);
    }
  });
} catch (error) {
  console.error(`An error occurred: ${error.message}`);
}
fs.writeFileSync(`../data/${filename}`, JSON.stringify(jsonResult));
