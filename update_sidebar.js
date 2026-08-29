const fs = require('fs');

let content = fs.readFileSync('apps/web/src/components/layout/sidebar.tsx', 'utf8');

// Replace panel background with sidebar background
content = content.replace(/background:\s*T\.panel/g, 'background: T.sidebar');
// Replace borderRight color with sidebarBorder
content = content.replace(/borderRight:\s*1px solid \$\{T\.border\}/g, 'borderRight: 1px solid ');
// Replace text color with sidebarText
content = content.replace(/color:\s*isExpanded \? T\.text : T\.muted/g, 'color: isExpanded ? T.sidebarText : T.sidebarMuted');
content = content.replace(/color:\s*T\.muted/g, 'color: T.sidebarMuted');
// Link active/inactive states
content = content.replace(/color:\s*active \? T\.g : hov \? \"var\(--t-heading\)\" : T\.muted/g, 'color: active ? T.g : hov ? T.sidebarText : T.sidebarMuted');

fs.writeFileSync('apps/web/src/components/layout/sidebar.tsx', content, 'utf8');
