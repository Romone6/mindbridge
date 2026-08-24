import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildFallbackResponseContent,
  deriveTriageState,
  enforceOneQuestion,
  getTriageQuestion,
  type TriageMessageLike,
} from "@/lib/triage/policy";

function user(content: string): TriageMessageLike {
  return { role: "user", content };
}

function assistant(content: string): TriageMessageLike {
  return { role: "assistant", content };
}

test("deriveTriageState tracks progression and next intent", () => {
  const state = deriveTriageState([
    assistant("How are you feeling today?"),
    user("I am anxious."),
    assistant("When did this start?"),
    user("Around three months ago."),
  ]);

  assert.deepEqual(state.answeredIntents, ["presenting_problem", "timeline"]);
  assert.equal(state.nextIntent, "severity");
  assert.equal(state.completionEligible, false);
});

test("deriveTriageState marks acute risk and safety intent", () => {
  const state = deriveTriageState([
    user("I cannot go on and I want to die."),
  ]);

  assert.equal(state.acuteRiskDetected, true);
  assert.equal(state.answeredIntents.includes("safety"), true);
});

test("deriveTriageState enables completion with required intents", () => {
  const state = deriveTriageState([
    user("I feel down."),
    user("It started six weeks ago."),
    user("It is very intense."),
    user("I can barely work."),
    user("No thoughts of harming myself or others."),
  ]);

  assert.equal(state.completionEligible, true);
  assert.equal(state.nextIntent, "support");
});

test("enforceOneQuestion collapses multi-question output", () => {
  const output = enforceOneQuestion(
    "Thank you for sharing. How long has this been happening? Has sleep changed too?",
    "sleep",
  );

  assert.equal(output, "Thank you for sharing. How long has this been happening?");
});

test("enforceOneQuestion appends fallback question when none present", () => {
  const output = enforceOneQuestion("Thank you for sharing", "support");
  assert.equal(
    output,
    "Thank you for sharing. Who do you currently have for support when things feel difficult?",
  );
});

test("buildFallbackResponseContent respects refusal and completion", () => {
  const refusalState = deriveTriageState([
    user("I would rather not say."),
  ]);
  const refusalOutput = buildFallbackResponseContent(refusalState);
  assert.equal(refusalOutput.includes("boundary"), true);

  const completedState = deriveTriageState([
    user("I feel low."),
    user("For two months."),
    user("Quite severe."),
    user("Work and home are affected."),
    user("No current thoughts of harm."),
  ]);
  const completedOutput = buildFallbackResponseContent(completedState);
  assert.equal(completedOutput.includes("prepare a clear summary"), true);
});

test("getTriageQuestion returns safe fallback for null intent", () => {
  assert.equal(
    getTriageQuestion(null),
    "Is there anything else you feel your clinician should know before we finish this intake?",
  );
});
