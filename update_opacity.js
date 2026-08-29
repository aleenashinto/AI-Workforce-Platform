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

    // Tailwind arbitrary values replacement: text-[rgba(255,255,255,0.7)] -> text-[color:var(--t-white-70)]
    // We can just replace the rgba part inside the brackets or generally:
    
    const map = {
        '0.02': '02',
        '0.03': '03',
        '0.05': '05',
        '0.1': '10',
        '0.2': '20',
        '0.3': '30',
        '0.4': '40',
        '0.5': '50',
        '0.6': '60',
        '0.7': '70'
    };

    // First replace inside tailwind text-[rgba...]
    // e.g. text-[rgba(255,255,255,0.7)] -> text-[color:var(--t-white-70)]
    content = content.replace(/text-\[rgba\(255,255,255,(0\.[0-9]+)\)\]/g, (match, p1) => {
        if (map[p1]) return 'text-[color:var(--t-white-' + map[p1] + ')]';
        return match;
    });
    // bg-[rgba...]
    content = content.replace(/bg-\[rgba\(255,255,255,(0\.[0-9]+)\)\]/g, (match, p1) => {
        if (map[p1]) return 'bg-[color:var(--t-white-' + map[p1] + ')]';
        return match;
    });
    
    // Normal JS string replacements
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*(0\.[0-9]+)\)/g, (match, p1) => {
        if (map[p1]) return 'var(--t-white-' + map[p1] + ')';
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
