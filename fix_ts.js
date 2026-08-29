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

    // Remove className="corners"
    content = content.replace(/\s+className=\"corners\"/g, '');

    // Also, to hide them without className, we can target them via CSS in globals.css.
    // They are span elements with width: 14 and height: 14 and absolute positioning.

    // Let's also fix sidebar.tsx T object
    if (file.includes('sidebar.tsx')) {
        content = content.replace(/panel:\s*\"var\(--t-panel\)\",/g, 'panel: "var(--t-panel)",\n    sidebar: "var(--t-sidebar)",\n    sidebarBorder: "var(--t-sidebar-border)",\n    sidebarText: "var(--t-sidebar-text)",\n    sidebarMuted: "var(--t-sidebar-muted)",');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
