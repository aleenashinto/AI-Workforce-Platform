const fs = require("fs");
const path = require("path");
const dir = "apps/worker/src/jobs";

const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith(".ts")) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, "utf8");

    const regex =
      /connection:\s*\{\s*host:\s*["']127\.0\.0\.1["'],\s*port:\s*6379,?\s*\}/g;
    const urlRegex = /connection:\s*\{\s*url:[^}]*\}/g;
    const urlRegex2 = /connection:\s*\{\s*\n?\s*url:[^}]*\}/g;

    let changed = false;

    if (
      regex.test(content) ||
      urlRegex.test(content) ||
      urlRegex2.test(content)
    ) {
      const replacement =
        'connection: new (require("ioredis").default || require("ioredis"))(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, lazyConnect: true, retryStrategy: () => null })';
      content = content.replace(regex, replacement);
      content = content.replace(urlRegex, replacement);
      content = content.replace(urlRegex2, replacement);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(fullPath, content);
      console.log(`Patched ${file}`);
    }
  }
}
