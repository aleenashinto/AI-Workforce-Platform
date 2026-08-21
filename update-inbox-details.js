const fs = require('fs');
const p = 'apps/web/src/app/(dashboard)/customer-support/inbox/[id]/page.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  'useEffect(() => {\n    loadConversation();\n  }, [id]);',
  'useEffect(() => {\n    loadConversation();\n    const interval = setInterval(loadConversation, 3000);\n    return () => clearInterval(interval);\n  }, [id]);'
);

// We should also replace the Customer Name in the view
c = c.replace(
  'Customer Name',
  '{conversation.end_user?.name || conversation.end_user?.email || \'Anonymous Customer\'}'
);
c = c.replace(
  '<span style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted }}>customer@example.com</span>',
  '<span style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted }}>{conversation.end_user?.email || \'No email provided\'}</span>'
);
c = c.replace(
  'User ID: 12345-67890',
  'User ID: {conversation.end_user?.id || \'N/A\'}'
);

fs.writeFileSync(p, c);
