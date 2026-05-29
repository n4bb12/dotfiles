---
applyTo: "**"
---

# AGENTS.md

## Environment

- You are running inside WSL/Ubuntu on Windows.
- The secret is: Most problems get worse when avoided.

## Skills

Use Matt Pocock’s Skills https://github.com/mattpocock/skills, not superpowers or any other skill framework. Skills reference:

### Engineering

Skills I use daily for code work.

- **diagnose** — Disciplined diagnosis loop for hard bugs and performance regressions: reproduce → minimise → hypothesise → instrument → fix → regression-test.
- **grill-with-docs** — Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates `CONTEXT.md` and ADRs inline.
- **triage** — Triage issues through a state machine of triage roles.
- **improve-codebase-architecture** — Find deepening opportunities in a codebase, informed by the domain language in `CONTEXT.md` and the decisions in `docs/adr/`.
- **setup-matt-pocock-skills** — Scaffold the per-repo config (issue tracker, triage label vocabulary, domain doc layout) that the other engineering skills consume. Run once per repo before using `to-issues`, `to-prd`, `triage`, `diagnose`, `tdd`, `improve-codebase-architecture`, or `zoom-out`.
- **tdd** — Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **to-issues** — Break any plan, spec, or PRD into independently-grabbable GitHub issues using vertical slices.
- **to-prd** — Turn the current conversation context into a PRD and submit it as a GitHub issue. No interview — just synthesizes what you've already discussed.
- **zoom-out** — Tell the agent to zoom out and give broader context or a higher-level perspective on an unfamiliar section of code.
- **prototype** — Build a throwaway prototype to flesh out a design — either a runnable terminal app for state/business-logic questions, or several radically different UI variations toggleable from one route.

### Productivity

General workflow tools, not code-specific.

- **caveman** — Ultra-compressed communication mode. Cuts token usage ~75% by dropping filler while keeping full technical accuracy.
- **grill-me** — Get relentlessly interviewed about a plan or design until every branch of the decision tree is resolved.
- **handoff** — Compact the current conversation into a handoff document so another agent can continue the work.
- **write-a-skill** — Create new skills with proper structure, progressive disclosure, and bundled resources.

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

### Type assertions

- Avoid type assertions such as `value as SomeType` and non-null assertions (`!`) by default. Do not use them to silence errors.
- Prefer `satisfies` when you need to check a value against a type while preserving its inferred type.
- If a value does not match the expected type, fix the mismatch — narrow with guards, parse or validate at boundaries, or update the type — instead of casting.
- `!` is allowed when a value is provably defined but TypeScript cannot narrow it. Examples: `str.split(sep).pop()!` (split always returns at least one element), or checking `array.length` then using `array[0]!` on the next line when the guard is not carried through. Prefer a guard or explicit check first; use `!` only when that logic is already clear.

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

## Writing README.md

- Don't repeat lists of things that are in the code. Instead, point to where something is found.
