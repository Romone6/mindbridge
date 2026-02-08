import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Allow img elements in favor of Next.js Image optimization where appropriate
      "jsx-a11y/alt-text": ["error", { img: ["Image"] }],
      // Allow button elements without type for Next.js Link compatibility
      "jsx-a11y/anchor-is-valid": ["error", {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
        aspects: ["invalidHref", "preferButton"]
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "scripts/**",
    "next-env.d.ts",
    // Project ignores migrated from .eslintignore:
    "dist/**",
    "node_modules/**",
    ".tmp/**",
    ".env*",
    "**/.next/**",
    "_deploy_snapshot/**",
    "_repo_rewrite*/**",
    "_wt_*/**",
    "backups/**",
  ]),
]);

export default eslintConfig;
