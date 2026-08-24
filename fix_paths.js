const fs = require("fs");
let content1 = fs.readFileSync(
  "apps/web/src/app/(dashboard)/drafts/page.tsx",
  "utf8",
);
content1 = content1.replace(/\/v1\/drafts/g, "/drafts");
fs.writeFileSync("apps/web/src/app/(dashboard)/drafts/page.tsx", content1);

let content2 = fs.readFileSync(
  "apps/web/src/app/(dashboard)/drafts/[id]/page.tsx",
  "utf8",
);
content2 = content2.replace(/\/v1\/drafts/g, "/drafts");
fs.writeFileSync("apps/web/src/app/(dashboard)/drafts/[id]/page.tsx", content2);
