const fs = require("fs");
const path = require("path");

const snapshotPath = path.join(__dirname, "drizzle/meta/0009_snapshot.json");
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

// Delete role from memberships
delete snapshot.tables["public.memberships"].columns.role;

// Add membership_roles
snapshot.tables["public.membership_roles"] = {
  name: "membership_roles",
  schema: "",
  columns: {
    id: {
      name: "id",
      type: "uuid",
      primaryKey: true,
      notNull: true,
      default: "gen_random_uuid()",
    },
    membership_id: {
      name: "membership_id",
      type: "uuid",
      primaryKey: false,
      notNull: true,
    },
    role: {
      name: "role",
      type: "text",
      primaryKey: false,
      notNull: true,
    },
  },
  indexes: {},
  foreignKeys: {
    membership_roles_membership_id_memberships_id_fk: {
      name: "membership_roles_membership_id_memberships_id_fk",
      tableFrom: "membership_roles",
      tableTo: "memberships",
      columnsFrom: ["membership_id"],
      columnsTo: ["id"],
      onDelete: "cascade",
      onUpdate: "no action",
    },
  },
  compositePrimaryKeys: {},
  uniqueConstraints: {},
};

fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

const journalPath = path.join(__dirname, "drizzle/meta/_journal.json");
const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
if (!journal.entries.find((e) => e.tag === "0010_roles")) {
  journal.entries.push({
    idx: journal.entries.length,
    version: "7",
    when: Date.now(),
    tag: "0010_roles",
    breakpoints: true,
  });
  fs.writeFileSync(journalPath, JSON.stringify(journal, null, 2));
}

console.log("Snapshot and journal updated successfully!");
