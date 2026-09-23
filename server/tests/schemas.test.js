import test from 'node:test';
import assert from 'node:assert/strict';
import { aiResearchResponseSchema } from '../src/schemas/researchSchemas.js';
import { aiVulnerabilityResponseSchema } from '../src/schemas/vulnerabilitySchemas.js';
import { aiClauseResponseSchema } from '../src/schemas/clauseSchemas.js';
import { aiBriefResponseSchema } from '../src/schemas/briefSchemas.js';

test('AI Zod Response Schemas Validation Suite', async (t) => {

  await t.test('Validates compliant Legal Research AI JSON', () => {
    const validJson = {
      answer: "The defendant provided proper notice under Section 4.2.",
      findings: [
        {
          claim: "Notice served on March 15",
          explanation: "Supported by exhibit A",
          citations: [
            {
              documentId: "11111111-1111-1111-1111-111111111111",
              documentName: "Exhibit_A.pdf",
              page: 3,
              chunkId: "22222222-2222-2222-2222-222222222222",
              quotedEvidence: "Notice was delivered via certified mail."
            }
          ]
        }
      ],
      conflicts: [],
      evidenceGaps: [],
      confidence: "high"
    };

    const parsed = aiResearchResponseSchema.parse(validJson);
    assert.equal(parsed.confidence, 'high');
    assert.equal(parsed.findings.length, 1);
  });

  await t.test('Validates compliant Vulnerability AI JSON', () => {
    const validJson = {
      overallAssessment: "Opposing argument is weakened by direct contractual contradiction.",
      vulnerabilities: [
        {
          type: "contractual_conflict",
          severity: "high",
          claim: "Plaintiff had no right to audit records",
          problem: "Section 7.3 explicitly confers quarterly audit rights",
          whyItMatters: "Disproves opposing defense of improper inspection",
          citations: []
        }
      ],
      missingEvidence: []
    };

    const parsed = aiVulnerabilityResponseSchema.parse(validJson);
    assert.equal(parsed.vulnerabilities[0].type, 'contractual_conflict');
    assert.equal(parsed.vulnerabilities[0].severity, 'high');
  });

  await t.test('Validates compliant Clause Comparison AI JSON', () => {
    const validJson = {
      summary: "Document A contains uncapped indemnification while Document B caps damages at $1M.",
      comparisons: [
        {
          topic: "Indemnification Cap",
          clauseA: { text: "Indemnity is unlimited.", citation: {} },
          clauseB: { text: "Indemnity shall not exceed $1,000,000.", citation: {} },
          difference: "Doc A has uncapped liability; Doc B has $1M cap.",
          conflict: true,
          significance: "Significant exposure variance"
        }
      ],
      ambiguities: [],
      missingProvisions: []
    };

    const parsed = aiClauseResponseSchema.parse(validJson);
    assert.equal(parsed.comparisons[0].conflict, true);
  });

  await t.test('Validates compliant Trial Brief AI JSON', () => {
    const validJson = {
      title: "Trial Brief in Support of Motion for Summary Judgment",
      questionsPresented: ["1. Whether notice was timely served."],
      facts: [{ statement: "Plaintiff delivered notice on March 15.", citations: [] }],
      issues: ["Issue 1: Timeliness of Notice"],
      rules: [{ rule: "Section 4.2 mandates 30 days notice.", citations: [] }],
      analysis: [{
        issue: "Timeliness of Notice",
        argument: "Notice was sent 35 days in advance, satisfying the 30-day requirement.",
        counterargument: "Defendant claimed mail delay.",
        response: "Certified mail tracking proves receipt within the required window.",
        citations: []
      }],
      evidenceGaps: [],
      conclusion: "For the foregoing reasons, judgment should be entered in favor of plaintiff."
    };

    const parsed = aiBriefResponseSchema.parse(validJson);
    assert.equal(parsed.title, "Trial Brief in Support of Motion for Summary Judgment");
    assert.equal(parsed.analysis.length, 1);
  });

  await t.test('Rejects invalid schemas missing mandatory keys', () => {
    assert.throws(() => {
      aiResearchResponseSchema.parse({
        // missing 'answer'
        findings: []
      });
    });
  });

});
