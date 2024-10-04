const fs = require("fs");
const path = require("path");
const filename = "FamilyFeud_Questions.json";

const jsonResult = [];

const questionRegexp = /^Запитання\s\d+:\s(.+[?.])$/;
const optionRegexp = /^(.*?)\s–\s(\d+)%$/;

try {
  const file = fs.readFileSync(path.resolve(__dirname, "../data/raw.txt"), {
    encoding: "utf8",
    flag: "r",
  });
  const lines = file.split(/\r?\n/);
  const item = {};
  lines.forEach((line) => {
    if (line.trim().length === 0) return;

    if (questionRegexp.test(line)) {
      if (Object.keys(item).length) {
        jsonResult.push({ ...item });
      }
      item.question = line.match(questionRegexp)[1];
      item.options = [];
      return;
    }
    if (optionRegexp.test(line)) {
      const [_, option, mark] = line.match(optionRegexp);
      item.options.push([option, mark]);
    }
  });
} catch (error) {
  console.error(`An error occurred: ${error.message}`);
}
fs.writeFileSync(
  path.resolve(__dirname, `../data/${filename}`),
  JSON.stringify(jsonResult, null, 1),
);
