<h1 align="center">
  <img alt="Logo" src="https://image.flaticon.com/icons/svg/994/994077.svg" height="48">
  dotfiles
</h1>

<p align="center">
  Config files, scripts, productivity stuff
</p>

<p align="center">
  <a href="https://circleci.com/gh/n4bb12/workflows/dotfiles">
    <img alt="CircleCI" src="https://flat.badgen.net/circleci/github/n4bb12/dotfiles?icon=circleci">
  </a>
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
code src/bash/load-order.ts
code src/install/index.ts

# Install
./dot install
```

#### Load

```bash
# Import into the current terminal:
source dist/bash.sh
```

#### Update

```bash
# Rebuild `dist` and update `dist/node_modules`:
bash dot update
```

#

Logo made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://image.flaticon.com/icons/svg/994/994077.svg" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
