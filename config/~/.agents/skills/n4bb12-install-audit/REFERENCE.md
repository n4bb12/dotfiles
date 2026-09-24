# Install source rules

Choose the source from what the software is and how it is used. There is no universal ranking.

## APT

Prefer APT for operating-system components, KDE/Plasma integration, drivers, shared libraries, low-level system utilities, tools that should track the Ubuntu release, and software that wants tight system integration.

Leave an APT package in place when the only difference is that another source is newer.

## Flatpak

Prefer Flathub for a desktop GUI app when the package is well maintained, sandboxing helps, a newer release is useful, and the app does not need deep host integration.

Check whether upstream publishes or verifies the Flatpak. Weigh permissions and portals before a migration recommendation.

## Snap

Keep or recommend Snap when it is the upstream or vendor-supported Linux method, Snap-specific behavior matters, or it is maintained better than the APT and Flatpak options.

Ubuntu shipping Snap is not itself a reason to choose it.

## Homebrew

Use Homebrew as a user-space manager for development and CLI tools when a newer CLI than Ubuntu's is needed, upstream has no better version manager, the package is for development, the same formula is useful on Linux and macOS, or the install should stay off the base system.

Leave Homebrew for core OS components, libraries Ubuntu packages link against, drivers, KDE/Plasma components, and services that belong as native Ubuntu packages.

When APT and Homebrew both install a tool, name which one `PATH` runs.

## Bun

Bun is the JavaScript/TypeScript runtime and the project package manager, and a fit for JavaScript CLI packages published on npm.

Project dependencies stay on that project's package manager and lockfile. `bun add -g` fits a JS/TS CLI that is an npm package, after checking three better fits: a project-local dependency, `bunx` with no global install, or an official standalone binary or version manager.

Bun is not a general Linux package manager. A non-JavaScript tool does not get a Bun wrapper for consistency.

## Version managers

For a language runtime or SDK, prefer the official version manager when switching versions matters. Rust goes through `rustup`. Python tooling goes through `uv`, `pyenv`, or the tool that matches the job. Node.js goes through a version manager when Node itself is required apart from Bun.

Leave a working install in place unless the change has a concrete benefit.

## Change labels

Use one label per row:

- **Keep** — current source is the right one
- **Consider migration** — a real benefit exists, and the cost is uncertain
- **Migrate** — the benefit is clear and the current source is the wrong model
- **Remove duplicate** — another install already wins, or this copy should stop shadowing it
- **Needs investigation** — ownership, usage, or the winning launcher is still unknown

A migration or removal needs one concrete advantage: better updates, upstream-supported distribution, less PATH ambiguity, sandboxing, better KDE integration, easier reproducibility, the correct version-management model, or fewer manually managed files.

## Maintenance checks

Look for duplicate installs, stale third-party APT repositories, manually downloaded `.deb` packages with no update repository, binaries copied into `/usr/local/bin`, obsolete AppImages, abandoned Snap or Flatpak packages, Homebrew packages shadowing Ubuntu tools, global Bun or npm CLIs that belong in a project or behind `bunx`, setup instructions that no longer match the machine, and manual installs that are unused.

## Report template

```markdown
# Install audit

## 1. Current strategy

<one short paragraph: which ecosystems are in use and what they are for on this machine>

## 2. Audit table

| Software | Current source | Winning path | Purpose | Recommended source | Change? | Reason |
|---|---|---|---|---|---|---|
| <name> | <apt / flatpak / snap / brew / bun / version manager / manual> | <path or desktop id> | <what it is for> | <source> | <label> | <one concrete reason> |

## 3. High-confidence migrations

### 3.1 <Software>: <current source> → <recommended source>

Current: <how it is installed and which path wins>
Advantage: <one concrete benefit>

```bash
<commands that perform this migration on this machine>
```

## 4. Optional improvements

### 4.1 <Software>: <current source> → <recommended source>

Current: <how it is installed and which path wins>
Advantage: <one concrete benefit>

```bash
<commands>
```

## 5. Duplicates and stale installs

### 5.1 <Software>

Wins today: <path or launcher>
Remove: <the losing or stale copy, and why it is stale>

```bash
<commands that remove only that copy>
```

## 6. README edits

File: `install/kubuntu/README.md`

### 6.1 <what the edit fixes>

```markdown
<exact replacement block>
```

## 7. Approve

Reply with the numbers to run, for example `3.1 5.2`.
```

Rules for the filled report:

- Sections 3 through 6 with no items contain the heading and the line `None.`
- Every action the user might run has its own number and its own `bash` fence.
- Commands are real for this machine: package ids, formula names, binary paths. No placeholders in the delivered report.
- A step that is not a shell command (a vendor download page, a logout) stays in the prose above the fence. The fence contains only the shell part.
- Section 6 fences are the exact Markdown to put in the README, not a description of the edit. A deletion fences the exact lines to remove, and the heading starts with `Delete`. If that body contains fences, wrap it in a longer fence so the block stays intact.
- **Needs investigation** stays in the table. It gets no section number and no bash fence.
- When the commands are a vendor's install procedure, read that procedure in this turn and copy it. Write the fence from that page, not from memory.
