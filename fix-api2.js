const fs = require('fs');
let code = fs.readFileSync('apps/api/routes/agent.ts', 'utf8');
code = code.replace(
  /leftJoin\(end_users, sql\`\$\{conversations\.visitor_id\} = \$\{end_users\.id\}::text\`\)/g,
  'leftJoin(end_users, eq(conversations.visitor_id, sql<string>`${end_users.id}::text`))'
);
fs.writeFileSync('apps/api/routes/agent.ts', code);
