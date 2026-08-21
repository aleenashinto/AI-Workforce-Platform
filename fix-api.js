const fs = require('fs');

const pAgent = 'apps/api/routes/agent.ts';
let agentCode = fs.readFileSync(pAgent, 'utf8');

// Replace all occurrences of destructuring from user
agentCode = agentCode.replace(
  /const\s+\{\s*org_id\s*\}\s*=\s*\(req\s*as\s*any\)\.user;/g,
  "const org_id = (req as any).user?.org_id || (req.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';"
);
fs.writeFileSync(pAgent, agentCode);

const pServer = 'apps/api/server.ts';
let serverCode = fs.readFileSync(pServer, 'utf8');
serverCode = serverCode.replace(
  "allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'Cookie'],",
  "allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'Cookie', 'x-org-id'],"
);
fs.writeFileSync(pServer, serverCode);
