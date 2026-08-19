const fs = require('fs');
const files = [
  'apps/web/src/app/(dashboard)/platform/profile/page.tsx',
  'apps/web/src/app/auth/invite/page.tsx',
  'apps/web/src/app/login/page.tsx',
  'apps/web/src/app/signup/page.tsx',
  'apps/web/src/contexts/UserContext.tsx'
];
files.forEach(f => {
  const full = 'd:/Project/' + f;
  if (!fs.existsSync(full)) return;
  let code = fs.readFileSync(full, 'utf8');
  code = code.replace(/\{ credentials: "include",/g, '{');
  fs.writeFileSync(full, code);
  console.log('Fixed', full);
});
