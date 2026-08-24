const fs = require("fs");
const file = "apps/web/src/app/(dashboard)/drafts/[id]/page.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace(
  /await apiClient.get<[^>]+>\(/g,
  "await apiClient.get(",
);
content = content.replace(
  /await apiClient.patch<[^>]+>\(/g,
  "await apiClient.patch(",
);
content = content.replace(
  /await apiClient.post<[^>]+>\(/g,
  "await apiClient.post(",
);
fs.writeFileSync(file, content);
