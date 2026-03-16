const fs = require("fs");
const path = require("path");

// Функция для рекурсивного обхода директорий
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

// Функция для замены localhost в файле
function replaceLocalhostInFile(filePath) {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts") && !filePath.endsWith(".js") && !filePath.endsWith(".jsx")) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Заменяем все вхождения localhost:3001 на localhost:3001
    content = content.replace(/localhost:3001/g, "localhost:3001");

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Запуск обновления
const srcDir = path.join(__dirname, "src");
console.log("Updating localhost references to 192.168.8.17...");

walkDir(srcDir, replaceLocalhostInFile);

console.log("Done!");
