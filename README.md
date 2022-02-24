<h1 align="center">
  <img alt="Logo" src="icon.png" height="48">
  dotfiles
</h1>

<p align="center">
  Config files, scripts, productivity stuff
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/n4bb12/dotfiles/master/LICENSE">
    <img alt="License" src="https://flat.badgen.net/github/license/n4bb12/dotfiles?icon=github">
  </a>
</p>

## Prerequisites

[Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) &middot; [Bash](https://www.google.de/search?q=install+bash) &middot; [Node](https://nodejs.org/en/download) &middot; [Yarn](https://yarnpkg.com/lang/en/docs/install)

## Usage

#### Install

```bash
# Clone
git clone https://github.com/n4bb12/dotfiles.git
cd dotfiles

# Comment out the parts you don't need
code bash/load-order.ts
code install/index.ts

# Install
bash dot build
```

#### Load

```bash
# Import into the current terminal:
source dist/bash.sh
```

#### Update

```bash
# Rebuild `dist` and update `dist` dependencies:
bash dot update
```

#

<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
