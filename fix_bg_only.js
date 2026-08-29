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

    // Hardcoded backgrounds -> Theme vars
    content = content.replace(/\[#0a1628\]/g, '[color:var(--t-panel)]');
    content = content.replace(/\[#040810\]/g, '[color:var(--t-bg)]');
    content = content.replace(/\[#070e1a\]/g, '[color:var(--t-bg2)]');
    
    // Inline styles replacements for backgrounds
    content = content.replace(/\"#0a1628\"/g, '"var(--t-panel)"');
    content = content.replace(/\"#040810\"/g, '"var(--t-bg)"');

    // Text whites -> Theme text
    content = content.replace(/\[#c8ffe8\]/gi, '[color:var(--t-text)]');
    content = content.replace(/\[#c8f2ff\]/gi, '[color:var(--t-text)]');

    // Specifically change the requested color to #351c75
    // The user asked to change #00cfffb3 (which is rgba(0,207,255,0.7))
    content = content.replace(/text-\[rgba\(0,207,255,0\.7\)\]/g, 'text-[#351c75]');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
