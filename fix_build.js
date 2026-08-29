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

    // Fix the color={} issue. Let's just remove the color prop since it defaults to T.g anyway and the errors are everywhere.
    // Or just clean up the tag entirely.
    // Replace <Corners className="corners" color={} className="corners" /> with <Corners className="corners" />
    content = content.replace(/<Corners\s+className=\"corners\"\s*color=\{\}\s*className=\"corners\"\s*\/>/g, '<Corners className="corners" />');
    
    // Also catch <Corners className="corners" color={} />
    content = content.replace(/<Corners\s+className=\"corners\"\s*color=\{\}\s*\/>/g, '<Corners className="corners" />');
    
    // Catch any remaining <Corners color={} />
    content = content.replace(/<Corners\s+color=\{\}\s*\/>/g, '<Corners className="corners" />');

    // Remove duplicated className="corners" just in case they are separated by spaces or other props
    content = content.replace(/className=\"corners\"\s+className=\"corners\"/g, 'className="corners"');
    
    // One more cleanup for <Corners className="corners" ... className="corners" />
    content = content.replace(/<Corners\s+className=\"corners\"([^>]*?)className=\"corners\"\s*\/>/g, '<Corners className="corners"  />');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed Corners syntax in', file);
    }
});
