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

    // Add borderRadius: "var(--t-radius)", right after background: T.panel,
    content = content.replace(/background:\s*T\.panel,/g, 'background: T.panel,\n          borderRadius: "var(--t-radius)",');
    // For T.bg (main background, often doesn't need radius, but maybe some containers do? Let's stick to panel)
    
    // Also, we have <Corners /> component in many files. We can add className="corners" to it.
    content = content.replace(/<Corners\s*\/>/g, '<Corners className="corners" />');
    content = content.replace(/<Corners\s*color=\{([^}]+)\}\s*\/>/g, '<Corners color={} className="corners" />');
    content = content.replace(/<Corners\s+/g, '<Corners className="corners" ');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated radius and corners in', file);
    }
});
