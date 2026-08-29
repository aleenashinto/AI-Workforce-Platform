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

    content = content.replace(/style=\{\{([\s\S]*?)\}\}/g, (match, body) => {
        const parts = body.split('borderRadius:');
        if (parts.length > 2) {
            const newBody = body.replace(/borderRadius:\s*\"var\(--t-radius\)\",?\s*/, '');
            return 'style={{' + newBody + '}}';
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
