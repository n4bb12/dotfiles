---
name: n4bb12-install-audit
description: Use when the user asks to audit installed apps or tools, choose among APT, Flatpak, Snap, Homebrew, Bun, or a version manager, find duplicate or stale installs, or align Kubuntu setup docs with what is actually installed.
argument-hint: "optional scope, e.g. one app or the whole machine"
---

# Install audit

Recommend how each app or tool should be installed. The deliverable is one report in chat. Finish when that report is complete and the machine and the setup docs are unchanged.

Run a listed command only after the user names its section number, for example `3.1` or `5.2`.

Scope is the whole machine unless the user names apps or a class of tools. A single app still gets the full report. Sections with nothing to say stay in place and say `None.`

## 1. Inventory

Done when every in-scope tool has a source and the binary or launcher that actually wins.

```bash
apt list --installed
dpkg-query -W
flatpak list
snap list
brew list
brew leaves
bun pm ls -g
echo "$PATH"
ls /etc/apt/sources.list.d
```

For each relevant binary, record `type -a`, `command -v`, and `readlink -f "$(command -v <binary>)"`.

Search `/usr/local/bin`, `/usr/local/lib`, `/opt`, `~/.local/bin`, `~/.local/share`, and `~/bin`. Note version managers and vendor installers when present (`rustup`, `mise`, `uv`, `nvm`, SDKMAN, AppImages, copied binaries, `.deb` files with no apt source). For GUI apps, see which `.desktop` file the session launches.

## 2. Cross-check

Read `install/kubuntu/README.md` in the dotfiles repo. Done when every tool that file names is checked against the machine, and every manually installed tool is checked against that file.

Flag a tool that is missing, whose documented method no longer matches, whose instructions are obsolete, that is installed but undocumented, or that exists from two managers. Name the path or launcher that wins.

## 3. Score

Score each in-scope tool with [REFERENCE.md](REFERENCE.md). A newer version alone is not a reason to leave APT.

## 4. Report

Write the report from the template in [REFERENCE.md](REFERENCE.md). Number every action `3.1`, `4.1`, `5.1`, `6.1`. Put each proposed command sequence in its own fenced `bash` block, complete enough to copy and run on this machine. Keep the reason outside the fence.
