const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/(dashboard)/platform/team/page.tsx', 'utf8');

const regex = /const handleInvite = \(\) => \{[\s\S]*?\}, 2000\);\n\s*\};/;
const replacement = 'const handleInvite = async () => {\\n' +
'    setInviteError("");\\n' +
'    if (!inviteName.trim()) { setInviteError("Name is required."); return; }\\n' +
'    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {\\n' +
'      setInviteError("A valid email is required."); return;\\n' +
'    }\\n' +
'    if (members.some((m) => m.email.toLowerCase() === inviteEmail.toLowerCase())) {\\n' +
'      setInviteError("A member with this email already exists."); return;\\n' +
'    }\\n\\n' +
'    try {\\n' +
'      const res = await fetch("/api/v1/team/invite", {\\n' +
'        method: "POST",\\n' +
'        headers: { "Content-Type": "application/json" },\\n' +
'        body: JSON.stringify({ email: inviteEmail.trim(), name: inviteName.trim(), role: inviteRole })\\n' +
'      });\\n' +
'      const data = await res.json();\\n' +
'      if (!res.ok) throw new Error(data.error || "Failed to send invite");\\n\\n' +
'      setMembers((prev) => [\\n' +
'        ...prev,\\n' +
'        { name: inviteName.trim() || inviteEmail.trim(), email: inviteEmail.trim(), roles: [inviteRole], status: "Pending", lastActive: "Never" },\\n' +
'      ]);\\n' +
'      setInviteSuccess(true);\\n\\n' +
'      setTimeout(() => {\\n' +
'        setShowInvite(false);\\n' +
'        setInviteSuccess(false);\\n' +
'        setInviteName("");\\n' +
'        setInviteEmail("");\\n' +
'      }, 2000);\\n' +
'    } catch (err: any) {\\n' +
'      setInviteError(err.message);\\n' +
'    }\\n' +
'  };';

content = content.replace(regex, replacement);
fs.writeFileSync('apps/web/src/app/(dashboard)/platform/team/page.tsx', content, 'utf8');
