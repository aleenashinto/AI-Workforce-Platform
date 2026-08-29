const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('apps/web/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/mono:\s*\"\'Share Tech Mono\', monospace\"/g, 'mono: "var(--t-font-mono)"');
    content = content.replace(/display:\s*\"\'Orbitron\', sans-serif\"/g, 'display: "var(--t-font-display)"');
    content = content.replace(/body:\s*\"\'Rajdhani\', sans-serif\"/g, 'body: "var(--t-font-body)"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated fonts in', file);
    }
});
