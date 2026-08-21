const fs = require('fs');
const path = require('path');
const p = path.resolve('apps/web/src/app/(dashboard)/customer-support/widget/page.tsx');
let c = fs.readFileSync(p, 'utf8');

c = c.replace('export default function WidgetConfigPage() {\n  const [activeTab, setActiveTab] = useState(\'appearance\');', 'export default function WidgetConfigPage() {\n  const [activeTab, setActiveTab] = useState(\'appearance\');\n  const { currentOrgId } = useUserContext();');

fs.writeFileSync(p, c);
