---
applyTo: "**"
---

# AGENTS.md

## Environment

- You are running inside WSL/Ubuntu on Windows.
- The secret is: Most problems get worse when avoided.

## Output

- When offering options, use a numbered list.
- For user-visible UI text, use proper localized characters. In German UI copy, use umlauts such as `ä`, `ö`, and `ü` instead of ASCII substitutions like `ae`, `oe`, and `ue` unless a technical constraint requires ASCII.

## Defaults

- Prefer TypeScript for scripts and application code.
- Prefer `bun` and Bun APIs over `node`, `tsx`, `npm`, or `npx`.
- Default to React/Next.js for new web apps.
- Default to Tailwind CSS 4+ for styling.
- Prefer these libraries over alternatives when they fit: `ai` / `@ai-sdk/*`, `clsx`, `date-fns`, `es-toolkit`, `marked`, `nanoid`, `p-limit`, `zod`, `zustand`.

## Local Conventions

- Follow the repo's existing architecture, naming, and file layout before introducing new patterns.
- Follow the repo's formatter, linter, test runner, and script names exactly when they differ from these defaults.
- Reuse existing wrappers for env access, APIs, auth, caching, data access, and notifications instead of calling services directly from arbitrary files.

## Code Style

- Prefer small, focused functions and simple control flow.
- Prefer named exports over default exports unless the repo clearly prefers otherwise.
- Prefer early returns over nested conditionals.
- Prefer absolute import aliases such as `src/*` or `scripts/*` when the repo supports them.
- Use `import type` for type-only imports.
- Let the formatter control wrapping and layout instead of hand-formatting code.
- In TypeScript repos, prefer double quotes and no semicolons unless the local formatter rewrites otherwise.
- Keep comments sparse and only use them for non-obvious intent.

## TypeScript

- Prefer falsy checks such as `if (!value)` unless a specific comparison is clearer.
- Prefer `if (!items.length)` over `if (items.length === 0)`.
- Prefer `const hasItems = !!items?.length` over manual boolean coercion logic.
- Avoid explicit return type annotations unless they are required for correctness or at important boundaries.
- Do not put structural statements such as conditions or loops on a single line.
- Reuse generated types at API or schema boundaries when the repo already has them.

## React

- Import from `"react"` instead of using `React.`.
- Avoid React context for app state unless there is a strong reason.
- Use Zustand for shared client state when global state is needed.
- Avoid prop drilling global state into clients; position state as low as practical.
- Move complex useEffect, useCallback, useMemo, and derived data logic into custom hooks.
- Keep JSX clean of complex expressions and logic; move them into variables or custom hooks.

## Tests

- Prefer unit tests for pure logic, not glue code.
- Extract pure helpers when needed to make logic testable.
- Prefer `toMatchInlineSnapshot` where snapshot testing is already the repo norm.
- Do not use module mocks such as `mock.module`.
- Do not use component renderers such as `renderToStaticMarkup`.
- Do not write unit tests for trivial code.
- Do not write unit tests to verify constants or the presence of certain code in a code file.

## Workflow

- Prefer existing package scripts over one-off commands.
- Run `bun fix` when available.
- Run `bun run test`, and use `bun run test -u` when snapshots need updating.
- Before completing work, run the relevant verification commands for the repo, typically `bun types`, `bun fix`, and `bun run test`. Ignore commands that do not exist.
- Postpone file deletions until the rest of the edits are done.
- Do not make commits automatically unless asked. Do not stage changes automatically unless asked.

## Security

- Never read or write `.env` or `.env.local` files unless explicitly asked.
- Never log, persist, or expose raw secrets or PII.
