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

    // This is getting hacky, but we just need to remove orderRadius: "var(--t-radius)",\s* 
    // IF the following text (up to }) contains another orderRadius:.
    
    // We can do this with a replacement function.
    content = content.replace(/style=\{\{([\s\S]*?)\}\}/g, (match, body) => {
        // If it has multiple borderRadius
        const parts = body.split('borderRadius:');
        if (parts.length > 2) {
            // It has multiple. Let's remove the first one that has "var(--t-radius)"
            const newBody = body.replace(/borderRadius:\s*\"var\(--t-radius\)\",?\s*/, '');
            return style={{}};
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
