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

    // We can just match any object literal that has two borderRadius properties in a row and remove the second one.
    // Or we can just globally search for borderRadius: "var(--t-radius)", and then whatever comes after up to the next brace.
    // It's safer to just remove orderRadius: (4|8|'50%'), or whatever if it's in the same block as orderRadius: "var(--t-radius)",.
    
    // Instead of regex hacking, I'll just remove orderRadius: \d+,? and orderRadius: '.*?(\d+|%)',? globally if they are near T.panel.
    
    content = content.replace(/(borderRadius:\s*\"var\(--t-radius\)\",[\s\S]{0,100}?)borderRadius:\s*\d+,?/g, '');
    content = content.replace(/(borderRadius:\s*\"var\(--t-radius\)\",[\s\S]{0,100}?)borderRadius:\s*\'[^\']*\',?/g, '');
    content = content.replace(/(borderRadius:\s*\"var\(--t-radius\)\",[\s\S]{0,100}?)borderRadius:\s*\"[^\"]*\",?/g, '');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
