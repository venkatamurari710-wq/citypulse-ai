// server/src/scripts/auditImports.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientSrcDir = path.resolve(__dirname, '../../../client/src');

function getAllJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllJsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = getAllJsxFiles(clientSrcDir);
console.log(`Auditing ${allFiles.length} files in client/src...`);

let issuesFound = 0;

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Collect imported & locally declared symbols
  const importedSymbols = new Set([
    'React', 'Component', 'useState', 'useEffect', 'useContext', 'useRef',
    'useCallback', 'useMemo', 'useReducer', 'Fragment', 'AnimatePresence', 'motion',
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'a', 'img',
    'svg', 'path', 'g', 'defs', 'linearGradient', 'stop', 'rect', 'circle', 'line',
    'label', 'input', 'select', 'textarea', 'option', 'form', 'nav', 'header',
    'footer', 'aside', 'main', 'section', 'article', 'table', 'thead', 'tbody',
    'tr', 'th', 'td', 'ul', 'li', 'ol', 'iframe', 'canvas', 'video', 'audio', 'source',
    'strong', 'b', 'i', 'em', 'small', 'code', 'pre', 'hr', 'br', 'Icon', 'CardIcon', 'Comp'
  ]);

  // Extract imports
  const importRegex = /import\s+(?:([\w$]+)|\{([^}]+)\}|[\w$]+\s*,\s*\{([^}]+)\})\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1]) importedSymbols.add(match[1].trim());
    if (match[2]) {
      match[2].split(',').forEach(s => {
        const parts = s.trim().split(/\s+as\s+/);
        const name = (parts[1] || parts[0]).trim();
        if (name) importedSymbols.add(name);
      });
    }
    if (match[3]) {
      match[3].split(',').forEach(s => {
        const parts = s.trim().split(/\s+as\s+/);
        const name = (parts[1] || parts[0]).trim();
        if (name) importedSymbols.add(name);
      });
    }
  }

  // Extract function parameters / destructuring e.g. ({ icon: Icon }) or function Foo(Icon)
  const propIconRegex = /:\s*([A-Z][\w$]*)/g;
  while ((match = propIconRegex.exec(content)) !== null) {
    importedSymbols.add(match[1]);
  }

  // Extract top-level declared components/functions/consts in file
  const declRegex = /(?:function|class|const|let|var)\s+([A-Z][\w$]*)/g;
  while ((match = declRegex.exec(content)) !== null) {
    importedSymbols.add(match[1]);
  }

  // Find all JSX tags <UpperCamelCase
  const jsxTagRegex = /<([A-Z][\w$]*)/g;
  const missingInFile = [];
  while ((match = jsxTagRegex.exec(content)) !== null) {
    const tagName = match[1];
    if (!importedSymbols.has(tagName)) {
      missingInFile.push(tagName);
    }
  }

  if (missingInFile.length > 0) {
    const uniqueMissing = [...new Set(missingInFile)];
    console.error(`❌ MISSING IMPORT IN: ${path.relative(clientSrcDir, filePath)}`);
    console.error(`   Missing JSX tags: ${uniqueMissing.join(', ')}`);
    issuesFound++;
  }
}

if (issuesFound === 0) {
  console.log(`✅ PERFECT! All ${allFiles.length} files passed import audit! No missing JSX tags or undeclared components found.`);
} else {
  console.error(`🚨 Found ${issuesFound} files with missing imports!`);
}
