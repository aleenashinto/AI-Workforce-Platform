const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== '.next') {
        files = files.concat(getAllFiles(full, exts));
      }
    } else if (exts.includes(path.extname(full))) {
      files.push(full);
    }
  }
  return files;
}

const files = getAllFiles('apps/web/src/app', ['.tsx']);
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('setShowFilter') || content.includes('showFilter') || content.includes('showFilters')) {
    console.log(f);
  }
}
