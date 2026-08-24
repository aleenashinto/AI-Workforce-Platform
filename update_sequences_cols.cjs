const fs = require("fs");
let content = fs.readFileSync("packages/db/schema.ts", "utf8");

content = content.replace(
  /export const sequences = pgTable\('sequences', \{([\s\S]*?)\}, \(table\) => \(\{/m,
  (match, p1) => {
    let newInner = p1;
    if (!newInner.includes("description: text('description')")) {
      newInner += `  description: text('description'),\n`;
    }
    if (!newInner.includes("goal: text('goal')")) {
      newInner += `  goal: text('goal'),\n`;
    }
    if (!newInner.includes("tags: jsonb('tags')")) {
      newInner += `  tags: jsonb('tags'),\n`;
    }
    if (!newInner.includes("settings: jsonb('settings')")) {
      newInner += `  settings: jsonb('settings'),\n`;
    }
    if (!newInner.includes("version: integer('version')")) {
      newInner += `  version: integer('version').default(1),\n`;
    }
    return `export const sequences = pgTable('sequences', {${newInner}}, (table) => ({`;
  },
);

content = content.replace(
  /export const sequence_steps = pgTable\('sequence_steps', \{([\s\S]*?)\}\);/m,
  (match, p1) => {
    let newInner = p1;
    if (!newInner.includes("name: text('name')")) {
      newInner += `  name: text('name'),\n`;
    }
    if (!newInner.includes("type: text('type')")) {
      newInner += `  type: text('type'),\n`;
    }
    return `export const sequence_steps = pgTable('sequence_steps', {${newInner}});`;
  },
);

fs.writeFileSync("packages/db/schema.ts", content);
console.log("Updated sequences and sequence_steps tables in schema.ts");
