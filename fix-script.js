const fs = require('fs');
let code = fs.readFileSync('scripts/seed-demo-data.ts', 'utf8');
code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('scripts/seed-demo-data.ts', code);
