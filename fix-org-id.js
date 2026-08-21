const fs = require('fs');
const p = 'apps/web/src/app/(dashboard)/customer-support/knowledge/add/page.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  'const { currentOrgId } = useUserContext();',
  'const currentOrgId = "00000000-0000-0000-0000-000000000001";'
);

fs.writeFileSync(p, c);
