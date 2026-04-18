---
applyTo: "**"
---

# AGENTS.md

## This Machine

You are running inside WSL/Ubuntu on Windows.

## Output Format

- When offering options to choose from, present them as a numbered list.

## Technology Preferences

- For writing scripts, prefer TypeScript and the bun runtime and APIs.
- Default to using Tailwind 4+ for styling.
- Default to using React/Next.js for new projects.

## TypeScript Library Preferenecs

Prefer these libraries over alternatives:

ai and @ai-sdk/
clsx
date-fns
es-toolkit
marked
nanoid
p-limit
zod
zustand

## TypeScript

- Prefer falsy checks (e.g., `if (!variable)`) over equals checks (e.g.,
  `if(variable === null)`), unless checking for a specific value is necessary
  for clarity or correctness.
- Avoid explicit return type annotations unless required for correctness or at
  critical boundaries.
- Prefer `if (!variable.length)` instead of `if (variable.length === 0)`.
- Prefer `const flag = !!variable?.length` over `const flag = variable && variable.length > 0`.
- Don't put structural statements such as conditions or loops on a single line.

## React

- Import from `"react"` instead of chaining `React.`.
- Avoid using React context for state.
- Use zustand for global state.
- Avoid prop drilling parent state into clients. Position state as low as
  possible, especially when state is global anyway.

## Unit Testing

- Use `toMatchInlineSnapshot` instead of `toEqual` or `toBe`.
- Only ever write unit tests for pure functions. Never test glue code. To make
  things testable, you may work around this by extracting logic into pure
  functions.
- Never use mocks such as `mock.module`.
- Never use component renderers such as `renderToStaticMarkup`.

## Command Line Tool Use

- Use `bun` and `bunx` for running scripts and commands instead of `node`, `tsx`,
  `npm`, or `npx`.
- Run `bun fix` to format code, run linting, compile typescript, and fix issues automatically, if supported.
- Run `bun run test` to run unit tests and `bun run test -u` to update snapshots
  if you need to.

## Completing Edits

- Postpone any file deletes until you made all other changes.
- Before completing, run `bun types`, `bun fix`, and `bun run test`. If one of
  the commands doesn't exist, ignore it. Fix errors before completing.
- Don't make commits automatically unless asked.

## Security

- Never read or write `.env` or `.env.local` files.
- Never log or persist raw secrets or PII.
