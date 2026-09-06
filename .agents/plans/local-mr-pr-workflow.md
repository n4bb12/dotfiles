# Lokaler MR/PR-Workflow

## Zielbild

Ein Companion-CLI und ein Agent-Skill für Merge Requests und Pull Requests in beliebigen Git-Arbeitskopien.

- Lokal eine Beschreibung in `.mr/description.md` anlegen und iterieren, im Editor ansehen
- Danach remote erstellen (`mr create`) oder aktualisieren (`mr update`)
- Bilder optional, als normales Markdown mit lokalen Pfaden
- Host aus der Origin-URL: GitLab via `glab`, GitHub via `gh` (wie [`git-pr`](aliases/git.sh))
- CLI: Workspace, Git-Inspection, Publish
- Skill: der aufrufende Coding-Agent schreibt und strukturiert den Text

Reset: `.mr/` löschen.

## Aufruf

Wie [`commit-my`](aliases/git.sh): Bash-Funktion `mr` startet das Bun-Script. Im Dotfiles-Repo zusätzlich `"mr": "bun scripts/mr/cli.ts"`.

```bash
mr init              # Workspace, Base-Branch fragen oder aus Config lesen
mr inspect           # Git-Fakten für den Agenten auffrischen
mr status            # Lokaler Stand, fehlende Bilder
mr render            # GitLab: Remote-Markdown lokal schreiben. GitHub: Attachments prüfen.
mr create            # Remote anlegen (nach lokalem Review)
mr update            # Remote aktualisieren (nach lokalem Review)
```

Agenten übergeben `--base <branch>`. Fehlt TTY und Config/Flag: Vorschläge drucken und mit Exit 1 abbrechen.

Bestehende Dependencies des Dotfiles-Repos. Authentifizierung über `glab` bzw. `gh`.

## Rollen

```text
Du / Agent                         CLI
-----------------------------      --------------------------------
MR erstellen/updaten sagen         mr init (Base-Branch, .mr/)
Beschreibung schreiben             mr inspect (Diff, Log, Status)
Bilder lokal ablegen               mr status / mr render
Lokal im Editor prüfen             mr create / mr update (glab oder gh)
```

Der Skill steuert den Agenten durch diesen Ablauf. Das CLI liest `.mr/description.md` und spricht den Host an.

## Lokale Beschreibung

Source of Truth: `.mr/description.md`.

Bilder als normale relative Markdown-Links, relativ zu dieser Datei, damit die Editor-Vorschau die PNGs zeigt:

```md
## Summary

Checkout uses a two-column layout.

## Changes

| Before | After |
| --- | --- |
| ![Before](./screenshots/01-before.png) | ![After](./screenshots/01-after.png) |
```

`description.md` bleibt unverändert lokal previewbar. Host-URLs stehen nicht in dieser Datei.

Nach dem ersten Publish:

- Agent aktualisiert `description.md` (weiterhin lokale Pfade)
- Neue Bilder nach `.mr/screenshots/` und als relative Links in `description.md`
- `mr update` published neu aus dieser Datei

Optionaler Marker-Block um den Agent-Text, damit manuell gepflegte Remote-Abschnitte beim Update erhalten bleiben. `--force`, wenn ein Remote-Text ohne Marker bewusst ersetzt werden soll.

## Publisher nach Plattform

```text
GitHub
  gh pr create|edit --body-file description.md --attach <jede lokale Bilddatei>
  gh lädt hoch und ersetzt lokale Referenzen durch Asset-URLs

GitLab
  POST /projects/:id/uploads per glab --form
  eigenes Script setzt das gelieferte Feld markdown in description.remote.md
  glab mr create|update --description-file description.remote.md
```

### GitHub: `gh --attach`

`gh pr create` und `gh pr edit` akzeptieren `--attach` (bis 50 Dateien). Steht im Body ein Link auf dieselbe Datei, z. B. `![Before](./screenshots/01-before.png)`, ersetzt `gh` den Pfad durch die GitHub-Asset-URL. Unreferenzierte Attachments würden angehängt; das CLI hängt nur Dateien an, die `description.md` auch verlinkt.

Matching in `gh` läuft über `filepath.Abs` relativ zum Prozess-CWD, nicht relativ zur Body-Datei. Deshalb den GitHub-Publish aus `.mr/` starten:

```bash
gh pr create \
  --title "Improve checkout" \
  --body-file description.md \
  --attach screenshots/01-before.png \
  --attach screenshots/01-after.png
```

Dann zeigen Markdown-Link und `--attach` auf dieselbe Absolute. `gh` findet das Git-Repo übergeordnet. Fehlt `--attach` in der installierten `gh`-Version: klarer Fehler mit Upgrade-Hinweis.

Jedes Create/Update muss die lokalen Bilder erneut anhängen, weil `description.md` lokale Pfade behält.

`--head` der aktuellen Branch setzen, damit `gh` nicht von sich aus pusht oder forkt. Fehlt der Branch auf Remote: Fehler mit Hinweis, selbst zu pushen.

### GitLab: Upload-API

```bash
glab api projects/:fullpath/uploads --form "file=@screenshots/01-before.png"
```

Antwortfeld `markdown` verwenden, URLs nicht selbst bauen. Relativlinks in einer Kopie ersetzen, Ergebnis nach `.mr/description.remote.md`. Cache `.mr/uploads.json` (Dateiname, SHA-256, `markdown`, `url`): gleicher Hash überspringt den Upload.

`glab mr create` ohne `--fill` (das Flag pusht). Fehlt der Branch auf Remote: Fehler mit Hinweis zu pushen.

## Base-Branch

Beim ersten `mr init` (TTY): `gum choose`. Vorschläge:

- bestehender MR/PR der aktuellen Branch, falls `glab`/`gh` das hergeben
- `origin/HEAD`
- lokale/remote Branches wie `main`, `master`, `develop`, `dev`, `next`, `staging`

Auswahl nach `.mr/config.json`. Weitere Commands lesen nur noch diese Datei.

```json
{
  "baseBranch": "develop"
}
```

`--base develop` überspringt den Dialog. `.mr/` löschen setzt zurück.

## Workspace

```text
.mr/
  config.json
  analysis.json          # Git-Fakten für den Agenten
  description.md         # lokale SoT, previewbar
  description.remote.md  # GitLab-Ableger für die Host-API
  screenshots/           # optional
  uploads.json           # GitLab-Hash-Cache
  context/               # optionale Extra-Notizen
```

`.mr/` steht im globalen [`config/~/.gitignore`](config/~/.gitignore) (`core.excludesfile` → `~/.gitignore`). `init` hängt `.mr/` an `.git/info/exclude`, falls die globale Ignore-Datei das noch nicht abdeckt. Die projektweite `.gitignore` bleibt unverändert.

## Agent-Skill

[`config/~/.agents/skills/mr/SKILL.md`](config/~/.agents/skills/mr/SKILL.md)

Einstieg, wenn jemand einen Merge Request oder Pull Request lokal vorbereiten, erstellen oder aktualisieren will.

1. `mr init` (mit `--base`, oder User im Terminal wählen lassen)
2. `mr inspect` lesen und `git status/log/diff` gegen `config.baseBranch` prüfen (Git ist SoT, Sessions und `.mr/context/` sind Zusatz)
3. `description.md` schreiben oder aktualisieren: reviewerfreundlich, thematisch, aus Diff und Kontext ableitbar. Bildlinks nur wenn ein visueller Vergleich hilft, als `./screenshots/….png`, plus konkrete Capture-Hinweise
4. User lokal ansehen lassen
5. Auf Wunsch `mr create` oder `mr update`

## Architektur (CLI)

```text
scripts/mr/
  cli.ts
  workspace.ts
  git.ts
  inspect.ts
  prompt-base.ts      # gum choose, --base, Config
  markdown.ts         # lokale Bildlinks finden; GitLab-Rewrite
  host.ts             # Interface
  gitlab.ts           # upload + description.remote.md + glab mr
  github.ts           # gh --body-file --attach, cwd .mr
  render.ts
  publish.ts
  types.ts
```

## Tests

- Base-Branch aus Config, Flag, und Reset durch Löschen von `.mr/`
- Auffinden lokaler Bildlinks, Durchreichen von `https://` und Host-Upload-Pfaden
- Fehlende Bilder, Beschreibung ohne Bilder, teilweise vorhandene Dateien
- GitHub: `gh`-Argv mit `--attach` je verlinkter Datei, CWD `.mr`, Fehler über 50 Dateien
- GitLab: Response über das Feld `markdown`, Hash-Cache
- Marker-Splice und `--force`
- Ignore-Idempotenz
- HostClient gemockt, ohne Netz

## Verifikation

`bun check`, `bun fix`, `bun test`.
