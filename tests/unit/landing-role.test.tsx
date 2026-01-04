import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
    DEFAULT_ROLE,
    ROLE_CONTENT,
    resolveLandingRole,
    type LandingRole,
} from "../../lib/landing-role-content";
import { RoleHeroCopy } from "../../components/landing/role-hero-copy";

test("resolveLandingRole prefers query role over stored role", () => {
    const resolved = resolveLandingRole({ queryRole: "admin", storedRole: "patient" });
    assert.equal(resolved, "admin");
});

test("resolveLandingRole falls back to stored role when query is invalid", () => {
    const resolved = resolveLandingRole({ queryRole: "unknown", storedRole: "patient" });
    assert.equal(resolved, "patient");
});

test("resolveLandingRole defaults to clinician when no valid role provided", () => {
    const resolved = resolveLandingRole({ queryRole: null, storedRole: null });
    assert.equal(resolved, DEFAULT_ROLE);
});

test("RoleHeroCopy renders the correct headline for each role", () => {
    (Object.keys(ROLE_CONTENT) as LandingRole[]).forEach((role) => {
        const html = renderToStaticMarkup(<RoleHeroCopy role={role} />);
        assert.ok(html.includes(ROLE_CONTENT[role].headline));
    });
});
