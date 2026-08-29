const fs = require('fs');

let css = fs.readFileSync('apps/web/src/app/globals.css', 'utf8');

css = css.replace(/:root\s*\{([\s\S]*?)\}/, (match, body) => {
    let newBody = body.replace(/--t-g:\s*#2563eb;/, '--t-g: #2563eb;\n  --t-g-rgb: 37, 99, 235;');
    newBody = newBody.replace(/--t-g2:\s*#[a-fA-F0-9]+;/, '--t-g2: #351c75;\n  --t-g2-rgb: 53, 28, 117;');
    return ':root {' + newBody + '}';
});

css = css.replace(/\.dark\s*\{([\s\S]*?)\}/, (match, body) => {
    let newBody = body.replace(/--t-g:\s*#00ff88;/, '--t-g: #00ff88;\n  --t-g-rgb: 0, 255, 136;');
    newBody = newBody.replace(/--t-g2:\s*#00cfff;/, '--t-g2: #00cfff;\n  --t-g2-rgb: 0, 207, 255;');
    return '.dark {' + newBody + '}';
});

fs.writeFileSync('apps/web/src/app/globals.css', css, 'utf8');
console.log('Fixed globals.css rgb vars');
