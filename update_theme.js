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

    content = content.replace(/\bg:\s*\"#[0-9a-fA-F]+\"/g, 'g: \"var(--t-g)\"');
    content = content.replace(/\bg2:\s*\"#[0-9a-fA-F]+\"/g, 'g2: \"var(--t-g2)\"');
    content = content.replace(/\bwarn:\s*\"#[0-9a-fA-F]+\"/g, 'warn: \"var(--t-warn)\"');
    content = content.replace(/\bred:\s*\"#[0-9a-fA-F]+\"/g, 'red: \"var(--t-red)\"');
    content = content.replace(/\bbg:\s*\"#[0-9a-fA-F]+\"/g, 'bg: \"var(--t-bg)\"');
    content = content.replace(/\bbg2:\s*\"#[0-9a-fA-F]+\"/g, 'bg2: \"var(--t-bg2)\"');
    content = content.replace(/\bpanel:\s*\"#[0-9a-fA-F]+\"/g, 'panel: \"var(--t-panel)\"');
    content = content.replace(/\btext:\s*\"#[0-9a-fA-F]+\"/g, 'text: \"var(--t-text)\"');
    
    // Rgba replacements
    content = content.replace(/\bborder:\s*\"rgba\([^\)]+\)\"/g, 'border: \"var(--t-border)\"');
    content = content.replace(/\bborder2:\s*\"rgba\([^\)]+\)\"/g, 'border2: \"var(--t-border2)\"');
    content = content.replace(/\bmuted:\s*\"rgba\([^\)]+\)\"/g, 'muted: \"var(--t-muted)\"');
    
    content = content.replace(/\bglow:\s*\"0 0 [^\"]+\"/g, 'glow: \"var(--t-glow)\"');
    content = content.replace(/\bglow2:\s*\"0 0 [^\"]+\"/g, 'glow2: \"var(--t-glow2)\"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
