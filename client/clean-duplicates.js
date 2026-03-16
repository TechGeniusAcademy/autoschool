const fs = require("fs");

// Читаем файл
const filePath = "./src/contexts/LanguageContext.tsx";
const content = fs.readFileSync(filePath, "utf8");

// Находим начало и конец русской секции
const ruStart = content.indexOf("const translations = {\n  ru: {");
const ruEnd = content.indexOf("\n  },\n  kz: {");

// Находим начало и конец казахской секции
const kzStart = content.indexOf("\n  kz: {");
const kzEnd = content.indexOf("\n  },\n};\n\ninterface");

// Извлекаем секции
const beforeRu = content.substring(0, ruStart);
const ruSection = content.substring(ruStart + 27, ruEnd);
const kzSection = content.substring(kzStart + 7, kzEnd);
const afterKz = content.substring(kzEnd);

// Функция для удаления дубликатов из секции
function removeDuplicates(section) {
  const lines = section.split("\n");
  const seen = new Set();
  const result = [];

  for (const line of lines) {
    const match = line.match(/^\s*(\w+):/);
    if (match) {
      const key = match[1];
      if (!seen.has(key)) {
        seen.add(key);
        result.push(line);
      } else {
        console.log(`Дубликат найден: ${key}`);
      }
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
}

// Обрабатываем секции
const cleanRuSection = removeDuplicates(ruSection);
const cleanKzSection = removeDuplicates(kzSection);

// Собираем файл обратно
const newContent = beforeRu + "const translations = {\n  ru: {" + cleanRuSection + "\n  },\n  kz: {" + cleanKzSection + afterKz;

// Сохраняем файл
fs.writeFileSync(filePath, newContent, "utf8");
console.log("Файл очищен от дубликатов!");
