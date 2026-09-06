# Local merge request / pull request

Companion CLI for a local `.mr/` workspace. Write the description yourself or with an agent, preview it, then create or update the request on GitHub (`gh`) or GitLab (`glab`).

## Commands

After sourcing dotfiles aliases, from any git repo:

```bash
mr init              # create .mr/, choose or keep the base branch
mr inspect           # refresh .mr/analysis.json from git
mr status            # check local images
mr render            # GitLab: write description.remote.md. GitHub: check attachments.
mr create            # create the remote request
mr update            # update the remote request
```

From this repo: `bun mr <command>`. Agents should pass `--base <branch>` to `mr init`.

Reset by deleting `.mr/`.

## Auth

- GitHub: `gh auth login`
- GitLab: `glab auth login`

`mr init` and `mr inspect` work without host auth. `mr render` / `mr create` / `mr update` need the CLI for that host.

The tool does not store tokens. It does not push, force-push, or merge. Push the branch yourself if create fails because the branch is missing on the remote.

## Local files

```text
.mr/
  config.json              # baseBranch
  analysis.json            # git facts for the agent
  description.md           # source of truth, previewable
  description.remote.md    # GitLab body after upload rewrite
  description.publish.md   # GitHub body sent to gh
  screenshots/             # optional
  uploads.json             # GitLab hash cache
  context/                 # optional notes
```

`.mr/` is listed in the global gitignore (`~/.gitignore`). `mr init` also adds it to `.git/info/exclude`. It is not committed.

## Screenshots

In `.mr/description.md` use normal relative links:

```md
| Before | After |
| --- | --- |
| ![Before](./screenshots/01-before.png) | ![After](./screenshots/01-after.png) |
```

GitHub: `gh pr create|edit --body-file … --attach …` rewrites those paths. GitLab: upload via `glab api …/uploads`, then replace links with the returned `markdown` URL. The local file keeps relative paths. GitLab caches uploads in `uploads.json` by content hash.

## Existing request

Generated text is wrapped in `<!-- mr-agent:generated:start/end -->`. On update, only that region is replaced. A remote description without markers is left alone unless you pass `--force`.
