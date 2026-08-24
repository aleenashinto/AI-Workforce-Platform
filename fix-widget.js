const fs = require("fs");
const path = require("path");
const p = path.resolve(
  "apps/web/src/app/(dashboard)/customer-support/widget/page.tsx",
);
let c = fs.readFileSync(p, "utf8");

c = c.replace(
  'import { useState, useEffect } from "react";',
  'import { useState, useEffect } from "react";\nimport { useUserContext } from "@/contexts/UserContext";\nimport { API_BASE } from "@/lib/api";',
);
c = c.replace(
  "export default function WidgetConfigPage() {\n  const [activeTab, setActiveTab] = useState('appearance');",
  "export default function WidgetConfigPage() {\n  const [activeTab, setActiveTab] = useState('appearance');\n  const { currentOrgId } = useUserContext();",
);
c = c.replace(
  "<Monitor color={T.g} size={32} /> Widget Config",
  "<Monitor color={T.g} size={32} /> AI Support Agent",
);
c = c.replace(
  "Customize the chat widget appearance and behavior.",
  "Chat Widget Configuration",
);

const oldFn = "const handleSendMessage = (e: React.FormEvent) => {";
const splitStart = c.indexOf(oldFn);
const splitEnd = c.indexOf("  return (", splitStart);

const newFn = `const handleSendMessage = async (e?: React.FormEvent, presetMsg?: string) => {
    if (e) e.preventDefault();
    const newMsg = presetMsg || inputValue;
    if (!newMsg.trim() || isTyping) return;

    setInputValue('');
    setTestMessages(prev => [...prev, { role: 'user', content: newMsg }]);
    setIsTyping(true);
    setTestMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(\`\${API_BASE}/v1/chat/test\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: currentOrgId, query: newMsg }),
      });

      if (!response.ok) throw new Error("Failed to communicate with AI Support API");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let textBuffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '');
              try {
                const data = JSON.parse(dataStr);
                if (data.token) {
                  textBuffer += data.token;
                  setTestMessages(prev => {
                    const newArr = [...prev];
                    const lastMsg = newArr[newArr.length - 1];
                    lastMsg.content = textBuffer;
                    return newArr;
                  });
                }
              } catch (err) {}
            }
          }
        }
      }
    } catch (err) {
      setTestMessages(prev => {
        const newArr = [...prev];
        const lastMsg = newArr[newArr.length - 1];
        lastMsg.content = "Error: Failed to fetch response from AI Agent backend.";
        return newArr;
      });
    } finally {
      setIsTyping(false);
    }
  };

`;

c = c.substring(0, splitStart) + newFn + c.substring(splitEnd);
c = c.replace(
  "onClick={() => setInputValue(q)}",
  "onClick={() => handleSendMessage(undefined, q)}",
);

fs.writeFileSync(p, c);
