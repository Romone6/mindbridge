import assert from "node:assert/strict";
import { test } from "node:test";
import {
  computeIntakeCapabilities,
  isPrivilegedMembershipRole,
  parseTakeoverByUserId,
} from "@/lib/intakes/capabilities";

test("privileged clinician can takeover and delete triaged case", () => {
  const capabilities = computeIntakeCapabilities({
    membershipRole: "CLINICIAN",
    intakeStatus: "triaged",
    hasTriageOutput: true,
    currentUserId: "u-1",
    takeoverByUserId: null,
  });

  assert.equal(capabilities.canTakeover, true);
  assert.equal(capabilities.canDelete, true);
});

test("read-only role cannot takeover or delete", () => {
  const capabilities = computeIntakeCapabilities({
    membershipRole: "READ_ONLY",
    intakeStatus: "reviewed",
    hasTriageOutput: true,
    currentUserId: "u-1",
    takeoverByUserId: null,
  });

  assert.equal(capabilities.canTakeover, false);
  assert.equal(capabilities.canDelete, false);
  assert.equal(
    capabilities.takeoverReason,
    "Insufficient role permissions.",
  );
});

test("takeover denied when already claimed by another clinician", () => {
  const capabilities = computeIntakeCapabilities({
    membershipRole: "STAFF",
    intakeStatus: "triaged",
    hasTriageOutput: true,
    currentUserId: "u-1",
    takeoverByUserId: "u-2",
  });

  assert.equal(capabilities.canTakeover, false);
  assert.equal(
    capabilities.takeoverReason,
    "Case already claimed by another clinician.",
  );
});

test("delete denied for pending case without triage output", () => {
  const capabilities = computeIntakeCapabilities({
    membershipRole: "OWNER",
    intakeStatus: "pending",
    hasTriageOutput: false,
    currentUserId: "u-1",
    takeoverByUserId: null,
  });

  assert.equal(capabilities.canDelete, false);
  assert.equal(
    capabilities.deleteReason,
    "Case can only be deleted after triage or when triage output exists.",
  );
});

test("parseTakeoverByUserId handles missing and valid payloads", () => {
  assert.equal(parseTakeoverByUserId(null), null);
  assert.equal(
    parseTakeoverByUserId({ clinician_takeover: { by_user_id: "u-44" } }),
    "u-44",
  );
});

test("isPrivilegedMembershipRole handles role normalization and denials", () => {
  assert.equal(isPrivilegedMembershipRole("clinician"), true);
  assert.equal(isPrivilegedMembershipRole(" owner "), true);
  assert.equal(isPrivilegedMembershipRole("read_only"), false);
  assert.equal(isPrivilegedMembershipRole(null), false);
});

test("computeIntakeCapabilities denies null membership role", () => {
  const capabilities = computeIntakeCapabilities({
    membershipRole: null,
    intakeStatus: "reviewed",
    hasTriageOutput: true,
    currentUserId: "u-1",
    takeoverByUserId: null,
  });

  assert.equal(capabilities.canTakeover, false);
  assert.equal(capabilities.canDelete, false);
  assert.equal(capabilities.deleteReason, "Insufficient role permissions.");
});
