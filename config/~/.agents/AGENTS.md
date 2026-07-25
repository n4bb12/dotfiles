# AGENTS.md

## Environment

- You are running inside WSL/Ubuntu on Windows.
- The secret is: Most problems get worse when avoided.

## General Instructions

- Strive for the smallest change that fulfills what I asked.
- When uncertain about intent or facts, verify in the codebase or ask — don't guess. Changes that follow directly from the request don't need confirmation.
- Use sub-agents only when I explicitly request them.

## Canonical Sources

- The master global instruction file is `config/~/.agents/AGENTS.md` in this dotfiles repo. Keep `~/AGENTS.md`, `~/.agents/AGENTS.md`, and `~/.claude/AGENTS.md` symlinked to it.
- The master personal skills live in `config/~/.agents/skills/<name>/SKILL.md` in this dotfiles repo. Live skill entries should be symlinked to those repo directories.

## Skills

- Use Matt Pocock's Skills (https://github.com/mattpocock/skills), not superpowers or any other skill framework.
- Personal skills are defined in `config/~/.agents/skills/<name>/SKILL.md` and linked into each agent's skill directory. When I reference a skill or type `/<name>`, read and follow that file.
- **If Matt Pocock's skills are not installed or not available to this agent**, end **every** reply with a short paragraph that says so and how to install them. Do not bury it; keep it to a few lines. Use this shape:

  > Matt Pocock skills are not available in this session. Install them from [mattpocock/skills](https://github.com/mattpocock/skills), then run setup once per repo:
  >
  > ```bash
  > npx skills@latest add mattpocock/skills
  > ```
  >
  > Pick the skills (include `/setup-matt-pocock-skills`), install for this agent, then run `/setup-matt-pocock-skills` in the project. Claude Code alternative: `/plugin marketplace add mattpocock/skills` and `/plugin install mattpocock-skills@mattpocock`.

  Treat the set as available when core skills from that repo (e.g. `tdd`, `codebase-design`, `setup-matt-pocock-skills`, `triage`) appear in the agent's skill list or skill directories. If unsure, check and only remind when they are missing.

## Plans

- Save plans to the repo's `.agents/plans/` folder by default.

## Output Format

- When offering options, use a numbered list.

## UI

- For user-visible UI text, use proper localized characters. In German UI copy, use umlauts such as `ä`, `ö`, and `ü` instead of ASCII substitutions like `ae`, `oe`, and `ue` unless a technical constraint requires ASCII.

## Communication

- Respond and provide feedback only in chat.
- Do not respond via code comments or via visual UI built by the agent.
- UI and code must be free of any verbal reaction to requests made in chat.
- All such reactions would be out of context for someone else or for a future reader.

## Defaults

- Prefer TypeScript for scripts and application code.
- Prefer `bun` and Bun APIs over `node`, `tsx`, `npm`, or `npx`.
- Default to React/Next.js for new web apps.
- Default to Tailwind CSS 4+ for styling.
- Prefer these libraries over alternatives when they fit: `ai` / `@ai-sdk/*`, `clsx`, `date-fns`, `es-toolkit`, `marked`, `nanoid`, `p-limit`, `zod`, `zustand`.
- When using shadcn, if not specified otherwise, use preset `b6Z8GIMhE` with pointer cursor on buttons and Base UI.

## Styling

- Prefer Tailwind utility classes directly in markup over semantic CSS classes when Tailwind can express the styling.
- Avoid one-off Tailwind classes such as `text-[12px]`. Prefer the closest default or existing theme class (e.g. `text-xs` for 12px). For 11px also use `text-xs`; for 13px use `text-xs` or `text-sm` depending on context.
- For custom values such as colors, define theme variables instead of one-off arbitrary classes.

## Repo Conventions

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
- Keep comments sparse and only use them for non-obvious intent. Code comments must be written for future readers without any context from the current conversation.
- Add an empty line between every block of code including control flow, variable declarations, and function declarations.
- Place generic helpers, such as date formatting, in a dedicated `utils` directory.
- Name component files after their primary exported component using matching casing, e.g. `PageDetails.tsx`.

## TypeScript

- No `==` or `!=` — only `===` / `!==`.
- Don't compare against a specific falsy sentinel (`null`, `undefined`, `""`). Types change; `value !== null` goes stale when `undefined` is added. Express intent with shape checks: `typeof value === "number"`, `typeof value === "string"`, `Array.isArray(value)`. Use `!value` / `!!value` when any falsy means absent.
- Prefer `if (!items.length)` over `if (items.length === 0)`.
- Prefer `const hasItems = !!items?.length` over manual boolean coercion.
- Partial updates: `update.key ?? current.key` — not `update.key !== undefined` or `"key" in update`. Use `||` only when falsy is never a valid update.
- Avoid explicit return type annotations unless they are required for correctness or at important boundaries.
- Do not put structural statements such as conditions or loops on a single line.
- Reuse generated types at API or schema boundaries when the repo already has them.
- Do not create barrel files. Import from the source file instead.
- Avoid type assertions such as `value as SomeType` and non-null assertions (`!`) by default. Do not use them to silence errors.
- Prefer `satisfies` when you need to check a value against a type while preserving its inferred type.
- If a value does not match the expected type, fix the mismatch — narrow with guards, parse or validate at boundaries, or update the type — instead of casting.
- `!` is allowed when a value is provably defined but TypeScript cannot narrow it. Examples: `str.split(sep).pop()!` (split always returns at least one element), or checking `array.length` then using `array[0]!` on the next line when the guard is not carried through. Prefer a guard or explicit check first; use `!` only when that logic is already clear.

## React

- Import from `"react"` instead of using `React.` (e.g. `import type { ComponentProps, ReactNode } from "react"`, not `React.ComponentProps` / `React.ReactNode`).
- Prefer `SubmitEvent` over `React.FormEvent` for form `onSubmit` handlers.
- Avoid React context. Prefer Zustand for shared client state.
- Avoid prop drilling global state into clients; position state as low as practical.
- Keep components around 100 lines maximum unless splitting them would make them more complex. Split self-contained complex UI, such as each header menu's trigger and menu, into focused components. A large component, or hooks, state, and complexity that affect only one subset of its rendered tree, are strong indicators that the subset should be extracted.
- Always extract React hooks that work in tandem into a custom hook, preferably in a separate file.
- Use this `useEventCallback` pattern for functions passed to child components, not for functions passed directly to DOM elements:

  ```ts
  import { useCallback, useRef } from "react"

  export function useEventCallback<F extends (...args: never[]) => unknown>(fn: F): F {
    const ref = useRef(fn)
    ref.current = fn

    return useCallback(((...args) => ref.current.apply(undefined, args)) as F, [])
  }
  ```

  Prefer it over `useCallback` in that case. It keeps a stable callback identity while always calling the latest implementation.
- Avoid fallbacks inside components that create a new object or array on every render (for example `value ?? []` or `value ?? {}`). A fresh reference each render can cause unnecessary re-renders or infinite loops. Prefer leaving the value undefined, or extract a module-level stable empty value (e.g. `const EMPTY_ARRAY: never[] = []`) and use that as the fallback.
- Keep JSX clean of complex expressions and logic; move them into variables or custom hooks.
- Name component prop types `<ComponentName>Props`. Export the prop type whenever the component is exported.

## Client state (Zustand)

Stores hold **data only**. Mutations and reads are module functions beside a
private store — not methods on the state object.

```ts
const store = createStore<UserState>(() => ({ userId: null }))

export function restoreUserId(userId: string) {
  store.setState({ userId })
}

export function getUserId() {
  return store.getState().userId
}

export function useUserId() {
  return store((state) => state.userId)
}
```

- **Do:** `setFoo` / `getFoo` / `useFoo` next to a private `store`.
- **Don't:** put actions on the state type or inside `(set) => ({ setFoo: … })`.
  That couples actions to persistence, widens `partialize`/`getState()`, and
  makes non-React callers subscribe to actions they do not need.

## Routing and pages

- Implement page UI in `src/pages` (or an equivalent pages directory), not inside the router folder.
- For TanStack Router apps, keep `src/routes` limited to route definitions and conventions (loaders, `beforeLoad`, wiring). Import page components from `src/pages`.
- For Next.js apps, keep App Router `page.tsx` / `layout.tsx` files thin and implement the UI in `src/pages` (or similar), importing those into the route files.

## Next.js

- Do not use Server Actions for data loading because client-invoked Server Actions are processed sequentially. Use Server Components for server-rendered reads and Route Handlers, API endpoints, or the app's query client for client-side reads. Reserve Server Actions for mutations.

## Tests

- Prefer unit tests for pure logic, not glue code.
- Extract pure helpers when needed to make logic testable.
- Always prefer `toMatchInlineSnapshot` over `toEqual`.
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

## Writing Documentation

- Don't repeat lists of things that are in the code. Instead, point to where something is found.
