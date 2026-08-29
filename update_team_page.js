const fs = require('fs');

let content = fs.readFileSync('apps/web/src/app/(dashboard)/platform/team/page.tsx', 'utf8');

// First replace the useState to be empty and add a useEffect
let newUseState = 
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  import(\eact\).then(({ useEffect }) => {
    // using dynamic import just to avoid dealing with changing imports if they aren't there
    // wait, we can just add useEffect to the top import
  });
;

// Let's do it safely
content = content.replace(/import \{ useState, useMemo \} from "react";/, 'import { useState, useMemo, useEffect } from "react";');

const stateBlock =   const [members, setMembers] = useState<Member[]>([
    { name: "Aleena",     email: "aleena@company.com",  roles: ["owner"],                        status: "Active",  lastActive: "Just now" },
    { name: "SupportBot", email: "bot@company.com",     roles: ["support_agent", "sales_rep"],   status: "Active",  lastActive: "Active" },
    { name: "John Doe",   email: "john@company.com",    roles: ["sales_lead"],                   status: "Pending", lastActive: "Never" }
  ]);;

const newBlock =   const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/team')
      .then(res => res.json())
      .then(data => {
        if (data && data.members) {
          const mappedMembers = [
            ...data.members.map((m: any) => ({
              name: m.name || m.email,
              email: m.email,
              roles: [m.role],
              status: m.status === 'active' ? 'Active' : 'Pending',
              lastActive: 'Unknown'
            })),
            ...(data.invitations || []).map((i: any) => ({
              name: i.email,
              email: i.email,
              roles: [i.role],
              status: 'Pending',
              lastActive: 'Never'
            }))
          ];
          setMembers(mappedMembers);
        }
      })
      .finally(() => setLoading(false));
  }, []);;

// I'll use a regex that matches the state block and replaces it.
content = content.replace(/const \[members, setMembers\] = useState<Member\[\]>\([\s\S]*?\]\);/, newBlock);

// Now update handleInvite
const handleInviteBlock = const handleInvite = () => {
    setInviteError("");
    if (!inviteName.trim()) { setInviteError("Name is required."); return; }
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setInviteError("A valid email is required."); return;
    }
    if (members.some((m) => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setInviteError("A member with this email already exists."); return;
    }

    setMembers((prev) => [
      ...prev,
      { name: inviteName.trim(), email: inviteEmail.trim(), roles: [inviteRole], status: "Pending", lastActive: "Never" },
    ]);
    setInviteSuccess(true);

    setTimeout(() => {
      setShowInvite(false);
      setInviteSuccess(false);
      setInviteName("");
      setInviteEmail("");
    }, 2000);
  };;

const newHandleInviteBlock = const handleInvite = async () => {
    setInviteError("");
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setInviteError("A valid email is required."); return;
    }
    if (members.some((m) => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setInviteError("A member with this email already exists."); return;
    }

    try {
      const res = await fetch('/api/v1/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), name: inviteName.trim(), role: inviteRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invite');
      
      setMembers((prev) => [
        ...prev,
        { name: inviteName.trim() || inviteEmail.trim(), email: inviteEmail.trim(), roles: [inviteRole], status: "Pending", lastActive: "Never" },
      ]);
      setInviteSuccess(true);

      setTimeout(() => {
        setShowInvite(false);
        setInviteSuccess(false);
        setInviteName("");
        setInviteEmail("");
      }, 2000);
    } catch (err: any) {
      setInviteError(err.message);
    }
  };;

content = content.replace(/const handleInvite = \(\) => \{[\s\S]*?\}, 2000\);\n\s*\};/, newHandleInviteBlock);

fs.writeFileSync('apps/web/src/app/(dashboard)/platform/team/page.tsx', content, 'utf8');
console.log("Replaced mock data and logic!");
