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

    // Hardcoded backgrounds
    content = content.replace(/\[#0a1628\]/g, '[color:var(--t-panel)]');
    content = content.replace(/\[#040810\]/g, '[color:var(--t-bg)]');
    content = content.replace(/\[#070e1a\]/g, '[color:var(--t-bg2)]');
    
    // Hardcoded greens
    content = content.replace(/\[#00ff88\]/gi, '[color:var(--t-g)]');
    content = content.replace(/rgba\(0,\s*255,\s*136,\s*([0-9.]+)\)/g, 'rgba(var(--t-g-rgb), )'); // We need to define rgb vars!
    
    // Hardcoded cyans
    content = content.replace(/\[#00cfff\]/gi, '[color:var(--t-g2)]');
    content = content.replace(/rgba\(0,\s*207,\s*255,\s*([0-9.]+)\)/g, 'rgba(var(--t-g2-rgb), )');

    // Text whites
    content = content.replace(/\[#c8ffe8\]/gi, '[color:var(--t-text)]');
    content = content.replace(/\[#c8f2ff\]/gi, '[color:var(--t-text)]');
    
    // Inline styles replacements for the same
    content = content.replace(/\"#0a1628\"/g, '"var(--t-panel)"');
    content = content.replace(/\"#040810\"/g, '"var(--t-bg)"');
    content = content.replace(/\"#00ff88\"/gi, '"var(--t-g)"');
    content = content.replace(/\"#00cfff\"/gi, '"var(--t-g2)"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed hardcoded colors in', file);
    }
});
