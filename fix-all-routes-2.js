const fs = require('fs');
const path = require('path');

const filesToFix = [
  'drafts.ts', 'mailboxes.ts', 'replies.ts', 'sales.ts', 'security.ts', 'sequences.ts'
];

for (const file of filesToFix) {
  const p = path.join('apps/api/routes', file);
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');
  
  // Replace: const { org_id } = request.user as any;
  code = code.replace(
    /const\s+\{\s*org_id\s*\}\s*=\s*request\.user\s*as\s*any;/g,
    "const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';"
  );
  
  fs.writeFileSync(p, code);
}
