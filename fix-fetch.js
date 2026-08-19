const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const p of fs.readdirSync(dir)) {
    const full = path.join(dir, p);
    if (fs.statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk('apps/web/src');
for (const f of files) {
  let code = fs.readFileSync(f, 'utf8');
  const oldCode = code;
  
  // Replace fetch calls that have an options object but no credentials
  code = code.replace(/fetch\(([^,]+),\s*\{/g, (match, p1) => {
    if (match.includes('credentials')) return match;
    return `fetch(${p1}, { credentials: "include",`;
  });
  
  // Also we need to catch fetch(url) and change it to fetch(url, { credentials: "include" })
  // But doing that via regex is tricky. Let's just replace simple fetch(url) manually where needed.
  code = code.replace(/fetch\(([^,]+)\)/g, (match, p1) => {
    if (match.includes('{') || match.includes('credentials')) return match;
    return `fetch(${p1}, { credentials: "include" })`;
  });

  if (code !== oldCode) {
    fs.writeFileSync(f, code);
    console.log(`Updated ${f}`);
  }
}
