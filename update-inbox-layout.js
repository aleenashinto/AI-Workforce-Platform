const fs = require('fs');
const p = 'apps/web/src/app/(dashboard)/customer-support/inbox/layout.tsx';
let c = fs.readFileSync(p, 'utf8');

const newCode = `  const [activeTab, setActiveTab] = useState("open");
  const [conversations, setConversations] = useState<{ all: any[], unassigned: any[], assigned: any[] }>({ all: [], unassigned: [], assigned: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadConvs = () => {
    fetchApi('/agent/conversations?search=' + encodeURIComponent(searchQuery))
      .then(data => {
        setConversations(data || { all: [], unassigned: [], assigned: [] });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch conversations", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadConvs();
    const interval = setInterval(loadConvs, 5000); // Poll every 5 seconds for real-time emulation
    return () => clearInterval(interval);
  }, [searchQuery]); // Re-run effect when search query changes

  const getFilteredList = () => {
    const list = conversations.all || [];
    return list.filter(c => {
      if (activeTab === 'open') return c.status === 'active';
      return c.status === activeTab;
    });
  };

  const list = getFilteredList();`;

c = c.replace(
  /const \[activeTab, setActiveTab\][\s\S]*?const list = getFilteredList\(\);/,
  newCode
);

c = c.replace(
  '<input type="text" placeholder="Search by name, tag, ID..."',
  '<input type="text" placeholder="Search by name, tag, ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}'
);

c = c.replace(
  '<span>{c.external_id || \'User\'}</span>',
  '<span>{c.end_user?.name || c.end_user?.email || c.external_id || \'User\'}</span>'
);

// We must also update how it renders the external id to use end_user data
c = c.replace(
  /{c.external_id || 'User'}/g,
  '{c.end_user?.name || c.end_user?.email || c.external_id || \'Anonymous User\'}'
);

fs.writeFileSync(p, c);
