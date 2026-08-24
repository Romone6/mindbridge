import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createClinicianHandoffSummary,
  normalizeClinicianHandoffSummary,
} from "@/lib/handoff/summary";

test("normalizeClinicianHandoffSummary maps legacy payload safely", () => {
  const normalized = normalizeClinicianHandoffSummary({
    summary: "Legacy summary",
    key_findings: ["finding 1", "", 123],
    analysis: "Legacy analysis",
    risk_score: 42.7,
  });

  assert.equal(normalized.schema_version, 1);
  assert.equal(normalized.summary, "Legacy summary");
  assert.deepEqual(normalized.key_findings, ["finding 1"]);
  assert.deepEqual(normalized.recommendations, []);
  assert.deepEqual(normalized.insights, []);
  assert.equal(normalized.analysis, "Legacy analysis");
  assert.equal(normalized.risk_score, 43);
});

test("normalizeClinicianHandoffSummary defaults for null input", () => {
  const normalized = normalizeClinicianHandoffSummary(null);

  assert.equal(normalized.summary, "No data yet.");
  assert.deepEqual(normalized.key_findings, []);
  assert.deepEqual(normalized.recommendations, []);
  assert.deepEqual(normalized.insights, []);
  assert.equal(normalized.analysis, "No analysis provided.");
  assert.equal(normalized.risk_score, null);
});

test("createClinicianHandoffSummary emits normalized v1 schema", () => {
  const created = createClinicianHandoffSummary({
    summary: "Structured summary",
    keyFindings: ["a", "b"],
    recommendations: ["r1"],
    insights: ["i1"],
    analysis: "Detailed analysis",
    riskScore: 101,
  });

  assert.equal(created.schema_version, 1);
  assert.equal(created.summary, "Structured summary");
  assert.deepEqual(created.key_findings, ["a", "b"]);
  assert.deepEqual(created.recommendations, ["r1"]);
  assert.deepEqual(created.insights, ["i1"]);
  assert.equal(created.analysis, "Detailed analysis");
  assert.equal(created.risk_score, 100);
});
