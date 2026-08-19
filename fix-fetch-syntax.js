const fs = require('fs');

const files = [
  'apps/web/src/app/(dashboard)/platform/profile/page.tsx',
  'apps/web/src/app/auth/invite/page.tsx',
  'apps/web/src/app/login/page.tsx',
  'apps/web/src/app/signup/page.tsx',
  'apps/web/src/contexts/UserContext.tsx',
  'apps/web/src/app/onboarding/complete/page.tsx'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let code = fs.readFileSync(f, 'utf8');
  
  // Fix double credentials
  code = code.replace(/credentials:\s*"include",\s*credentials:\s*"include"/g, 'credentials: "include"');
  code = code.replace(/credentials:\s*"include",\s*credentials:\s*'include'/g, 'credentials: "include"');
  code = code.replace(/credentials:\s*"include",\s*\n\s*credentials:\s*"include"/g, 'credentials: "include"');
  
  // Also, some files might have it twice anywhere in the fetch options block.
  // Actually, I can just find the second one and remove it. But regex above might catch them if they are adjacent.
  // Let's also remove body-less POST that have application/json headers in onboarding complete.
  
  if (f.includes('onboarding/complete/page.tsx')) {
    code = code.replace(/method:\s*'POST',\s*headers:\s*{\s*'Content-Type':\s*'application\/json'\s*}/g, 
                        "method: 'POST'");
  }
  
  fs.writeFileSync(f, code);
}

console.log("Cleanup done.");
