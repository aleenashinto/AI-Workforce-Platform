const fs = require("fs");
const path = require("path");

function walk(dir) {
  fs.readdirSync(dir).forEach((f) => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      let content = fs.readFileSync(p, "utf8");

      // We want to replace process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      // with process.env.NEXT_PUBLIC_API_URL
      // However, it could be inside `${...}`

      const targetStr =
        'process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"';
      if (
        content.includes(targetStr) &&
        !p.includes("client.ts") &&
        !p.includes("api.ts")
      ) {
        content = content
          .split(targetStr)
          .join("process.env.NEXT_PUBLIC_API_URL");
        fs.writeFileSync(p, content);
        console.log("Fixed API fallback in " + p);
      }
    }
  });
}

walk("apps/web/src");
