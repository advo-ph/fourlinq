import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // shadcn/ui components are vendored verbatim — don't lint them. Their style
  // (empty interfaces extending a supertype, mixed component + hook exports)
  // is intentional upstream convention and we don't maintain them.
  { ignores: ["dist", "src/components/ui/**", "packages/cms-rag/**", "server/index.bundle.cjs"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // tailwind.config.ts uses `require()` for the Tailwind plugin API; it's the
  // upstream-documented way and not changeable.
  {
    files: ["tailwind.config.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Server adapters operate on polymorphic DB row shapes; `any` is the
  // pragmatic type here. Tightening to per-adapter interfaces is a separate
  // refactor (see ROADMAP Phase 5 — static copy + branches to DB).
  {
    files: ["server/**/*.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
);
