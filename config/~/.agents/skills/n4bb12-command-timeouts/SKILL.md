---
name: n4bb12-command-timeouts
description: Use when running a shell command that can take more than a few seconds, including typecheck, lint, tests, install, build, a dev server, a database setup, a network or GitHub call, or when waiting on a background process.
---

# Command timeouts

Put a hard `timeout` on every shell command that can run past a few seconds. The shell has to return. A wait loop, or reading an output file that stays open until a job exits, holds the turn for as long as the job runs.

## Caps

`timeout` is GNU coreutils. The number is a ceiling. Stop when it fires (exit 124). Report that the cap was hit and the last lines you have. Do not start the same command again.

| Work | Seconds |
| --- | --- |
| Typecheck | 180 |
| Lint or a dead-code scan | 180 |
| A filtered test run | 180 |
| The full test suite | 300 |
| Install or build | 180 |
| Network calls, including GitHub | 30 |
| One status check of something already running | 15 |

A full typecheck and a lint that typechecks the project each build the whole program. Run one at a time, each with its own timeout. Do not chain them in a single command.

A project's own instructions may name the real commands and tighter caps. Those win over this table.

## Shape

`timeout` wraps the command that does the work. A pipe does not extend the cap to `tail`.

```bash
timeout 180 <typecheck-command> > /tmp/typecheck.out 2>&1
tail -n 40 /tmp/typecheck.out
```

The result that comes back is those last lines, or the error. Not the full log.

## Waiting

Do not:

- loop on `kill -0`, `echo waiting`, or `sleep` until a pid exits
- wrap such a loop in a long `timeout`
- `cat` or `tail -f` a task file that blocks until a background job finishes

A dev server or watcher starts in the background and the turn returns. One `timeout 15` status read is the only check.
