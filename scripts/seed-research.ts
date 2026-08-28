import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const ORG = "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log("?? Seeding research history database...");

  // Clean existing research for demo org
  await sql.unsafe(`DELETE FROM research_projects WHERE org_id = '${ORG}'`);

  const mockPayload = {
    plan: {
      queries: [
        "Apollo pricing model and seat pricing 2026",
        "Outreach.io product tiers and features",
        "Lemlist features and B2B pricing comparison"
      ]
    },
    sources: [
      {
        id: "source-1",
        title: "[DEMO DATA] Apollo.io Pricing and Plans",
        url: "https://www.apollo.io/pricing",
        domain: "apollo.io",
        type: "pricing",
        relevanceScore: 0.95,
        publishedAt: "2026-02-15"
      },
      {
        id: "source-2",
        title: "[DEMO DATA] Outreach.io Sales Execution Platform Review",
        url: "https://www.g2.com/products/outreach/reviews",
        domain: "g2.com",
        type: "review",
        relevanceScore: 0.88,
        publishedAt: "2026-04-10"
      }
    ],
    findings: [
      {
        id: "finding-1",
        title: "Seat-Based Pricing Constraints",
        summary: "Both Apollo and Outreach enforce strict seat-based licensing models, ranging from $49/user/month to $120/user/month for enterprise automation plans.",
        confidence: "high",
        sourceIds: ["source-1", "source-2"]
      }
    ],
    evidence: [
      {
        id: "evidence-1",
        claim: "Apollo.io professional plans start at $99 per seat monthly.",
        evidence: "Apollo pricing matrix documents $99 pricing for standard outbound automation seats.",
        sourceId: "source-1",
        confidence: "confirmed"
      }
    ],
    conflicts: [
      {
        claim: "Outreach.io setup fees",
        sourceA: "Review sites assert $1,500 setup requirements.",
        sourceB: "Outreach sales agents claim customizable setups with no minimum limits.",
        difference: "Contradiction on implementation setup requirements.",
        explanation: "Outreach has waived implementation pricing for startups but retains it for enterprise accounts."
      }
    ],
    recommendations: [
      {
        title: "Flexible Team Bundles",
        reason: "Competitors rely strictly on individual seat licenses, making it expensive for expanding sales support divisions.",
        impact: "Lower cost barrier to entry for early-stage startups.",
        priority: "high"
      }
    ],
    report: {
      executiveSummary: "This research project analyzes competitor licensing models and features to position our platform effectively. Apollo.io retains standard seat pricing structure, whereas Outreach.io targets enterprise-wide contracts.",
      methodology: "Data gathered via public pricing documents, review portal aggregations, and standard feature matrix scraping.",
      limitations: "Competitor enterprise custom tiers are hidden behind direct sales quotes."
    }
  };

  // 1. Completed project
  const p1Id = uuidv4();
  await sql.unsafe(`
    INSERT INTO research_projects (id, org_id, title, question, objective, type, depth, status, payload)
    VALUES (
      '${p1Id}',
      '${ORG}',
      'Competitor Pricing and Product Matrix - Q3 2026',
      'What are the current pricing tiers, seat constraints, and core product features of our top three competitors in the AI Sales Outreach space (specifically Apollo, Outreach.io, and Lemlist)?',
      'Map out competitor feature matrices to identify product gaps and pricing strategies for our Q3 marketing campaign.',
      'Competitor Research',
      'Standard',
      'completed',
      '${JSON.stringify(mockPayload).replace(/'/g, "''")}'
    )
  `);

  // 2. Active project
  const p2Id = uuidv4();
  await sql.unsafe(`
    INSERT INTO research_projects (id, org_id, title, question, objective, type, depth, status, payload)
    VALUES (
      '${p2Id}',
      '${ORG}',
      'B2B Compliance and Data Laws in APAC',
      'What are the latest compliance changes, data protection acts, and B2B cold emailing restrictions introduced in the APAC region (India, Singapore, Australia) for 2026?',
      'Outline legal frameworks and suppression list rules required to expand our sales operations into APAC safely.',
      'Market Research',
      'Deep',
      'searching',
      '{}'
    )
  `);

  console.log("? Research history successfully seeded!");
  await sql.end();
  process.exit(0);
}

main().catch(e => {
  console.error("Error seeding research:", e.message);
  process.exit(1);
});
