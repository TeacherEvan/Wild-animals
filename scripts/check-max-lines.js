const fs = require('fs');
const path = require('path');

const MAX_LINES = 200;
const EXTENSIONS = new Set(['.js', '.css', '.html']);
const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', '.snapshots']);
const violations = [];

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split(/\r?\n/).length;
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (EXCLUDED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    const lineCount = countLines(fullPath);
    if (lineCount > MAX_LINES) {
      violations.push({
        path: path.relative(process.cwd(), fullPath),
        lineCount
      });
    }
  }
}

walk(process.cwd());

if (violations.length > 0) {
  console.error(`Found source files over ${MAX_LINES} lines:`);
  violations.forEach(({ path: filePath, lineCount }) => {
    console.error(`- ${filePath}: ${lineCount} lines`);
  });
  process.exit(1);
}

console.log(`All HTML, CSS, and JS files are within ${MAX_LINES} lines.`);
