const fs = require('fs');
const p = 'apps/web/src/app/(dashboard)/customer-support/widget/page.tsx';
let c = fs.readFileSync(p, 'utf8');

const importAdd = `import { API_BASE } from "@/lib/api";`;
c = c.replace('import { useState, useEffect } from "react";', importAdd + '\nimport { useState, useEffect } from "react";');

const states = `
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Hardcode orgId for local testing matching the rest of the dashboard
  const currentOrgId = "00000000-0000-0000-0000-000000000001";

  useEffect(() => {
    fetch(\`\${API_BASE}/agent/widget-config\`, { headers: { 'x-org-id': currentOrgId } })
      .then(res => res.json())
      .then(data => {
        if (data.config) {
          if (data.config.brandColor) setBrandColor(data.config.brandColor);
          if (data.config.position) setPosition(data.config.position);
          if (data.config.launcherIcon) setLauncherIcon(data.config.launcherIcon);
          if (data.config.greeting) setGreeting(data.config.greeting);
          if (data.config.suggestedQuestions) setSuggestedQuestions(data.config.suggestedQuestions);
          if (data.config.primaryLanguage) setPrimaryLanguage(data.config.primaryLanguage);
          if (data.config.escalationBehavior) setEscalationBehavior(data.config.escalationBehavior);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('Saving...');
    try {
      const res = await fetch(\`\${API_BASE}/agent/widget-config\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-org-id': currentOrgId },
        body: JSON.stringify({
          brandColor, position, launcherIcon, greeting, suggestedQuestions, primaryLanguage, escalationBehavior
        })
      });
      if (res.ok) {
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Error saving');
      }
    } catch(e) {
      setSaveStatus('Error saving');
    } finally {
      setIsSaving(false);
    }
  };
`;

c = c.replace('export default function WidgetConfigPage() {', 'export default function WidgetConfigPage() {' + states);

// Update button
c = c.replace(
  '<Save size={16} /> Save Changes',
  '<Save size={16} /> {isSaving ? "Saving..." : "Save Changes"} {saveStatus === "Saved!" && "✓"}'
);
c = c.replace(
  'button style={{',
  'button onClick={handleSave} disabled={isSaving} style={{'
);

fs.writeFileSync(p, c);

const apiRoute = 'apps/api/routes/agent.ts';
let apiCode = fs.readFileSync(apiRoute, 'utf8');

// The widget config endpoints need to read 'x-org-id' if req.user is undefined
apiCode = apiCode.replace(
  'const { org_id } = (req as any).user;',
  'const org_id = (req as any).user?.org_id || req.headers["x-org-id"];'
);
apiCode = apiCode.replace(
  'const { org_id } = (req as any).user;',
  'const org_id = (req as any).user?.org_id || req.headers["x-org-id"];'
);

fs.writeFileSync(apiRoute, apiCode);
