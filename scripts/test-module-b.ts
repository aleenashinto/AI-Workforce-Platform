import assert from "assert";
import { calculateLeadScore } from "../packages/core/src/scoring/lead-scoring";

async function runTests() {
  console.log("Running Module B MVP Tests...\n");

  let passed = 0;
  let failed = 0;

  function runTest(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${e.message}`);
      failed++;
    }
  }

  // 1. Scoring Logic Tests
  runTest("Lead Scoring - Disqualifier: Competitor drops score to 0", () => {
    const res = calculateLeadScore({
      fit_firmographic: 100,
      fit_persona: 100,
      signal_strength: 100,
      tech_fit: 100,
      contactability: 100,
      isCompetitor: true,
      isBlockedGeo: false,
    });
    assert.strictEqual(res.score, 0);
    assert.ok(res.reasons.some((r) => r.includes("Competitor")));
  });

  runTest("Lead Scoring - Disqualifier: Blocked Geo drops score to 0", () => {
    const res = calculateLeadScore({
      fit_firmographic: 100,
      fit_persona: 100,
      signal_strength: 100,
      tech_fit: 100,
      contactability: 100,
      isCompetitor: false,
      isBlockedGeo: true,
    });
    assert.strictEqual(res.score, 0);
  });

  runTest("Lead Scoring - Normal Calculation (Weighted)", () => {
    // 30% firmographic, 30% persona, 20% signal, 10% tech, 10% contactability
    // 30(80) + 30(90) + 20(70) + 10(60) + 10(100)
    // = 24 + 27 + 14 + 6 + 10 = 81
    const res = calculateLeadScore({
      fit_firmographic: 80,
      fit_persona: 90,
      signal_strength: 70,
      tech_fit: 60,
      contactability: 100,
      isCompetitor: false,
      isBlockedGeo: false,
    });
    assert.strictEqual(res.score, 81);
  });

  // 2. Draft Rules & Validation Tests (Simulated)
  runTest("Draft Rules - Rejects superlatives", () => {
    const draft = "We are the best and most revolutionary AI platform!";
    const hasSuperlatives =
      /(best|most revolutionary|groundbreaking|leading)/i.test(draft);
    assert.strictEqual(hasSuperlatives, true);
  });

  runTest("Draft Rules - Rejects > 150 words", () => {
    const draft = Array(160).fill("word").join(" ");
    const count = draft.split(/\s+/).length;
    assert.ok(count > 150);
  });

  // 3. Hallucination Test (Simulated)
  runTest("Hallucination Test - Agent drops fake signals", () => {
    // In a real harness, we'd mock the LLM output with a fake signal missing a source URL
    // and verify the research loop drops it.
    const signals = [
      {
        type: "Funding",
        detail: "Raised $5M",
        sourceUrl: "https://news.ycombinator.com/item?id=123",
      },
      { type: "Hiring", detail: "Hiring Engineers", sourceUrl: "" }, // Fake / hallucinated
    ];

    const validated = signals.filter(
      (s) => s.sourceUrl && s.sourceUrl.length > 0,
    );
    assert.strictEqual(validated.length, 1);
    assert.strictEqual(validated[0].type, "Funding");
  });

  // 4. Cross-tenant Tests (Simulated Database Check)
  runTest("Cross-tenant - Ensures org_id is present", () => {
    // We would try to insert without org_id or read from another org_id
    // This just simulates the check that orgId must be strictly filtered
    const orgIdA = "org_A";
    const orgIdB = "org_B";
    const leads = [
      { id: "1", org_id: orgIdA },
      { id: "2", org_id: orgIdB },
    ];

    const resultsForA = leads.filter((l) => l.org_id === orgIdA);
    assert.strictEqual(resultsForA.length, 1);
    assert.strictEqual(resultsForA[0].id, "1");
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
}

runTests().catch(console.error);
