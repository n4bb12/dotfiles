// Future versions of Hyper may add additional config options,
// which will not automatically be merged into this file.
// https://hyper.is#cfg
// https://github.com/bnb/awesome-hyper#contents

// TODO Productivity
// https://www.npmjs.com/package/hyperterm-summon
// https://github.com/bnb/awesome-hyper#customization
// https://www.npmjs.com/package/hyperterm-dibdabs
// https://www.npmjs.com/package/hyperterm-tabs
// https://www.npmjs.com/package/hyper-match
// https://www.npmjs.com/package/hyper-broadcast or https://www.npmjs.com/package/hyper-copycat
// https://www.npmjs.com/package/hyperterm-safepaste

// TODO Customization
// https://www.npmjs.com/package/hypertheme
// https://www.npmjs.com/package/hyper-blink
// https://www.npmjs.com/package/hyperterm-cursor
// https://www.npmjs.com/package/hyper-tab-icons or https://www.npmjs.com/package/hyper-tabs-enhanced
// https://www.npmjs.com/package/hyper-transparent
// https://www.npmjs.com/package/hyper-wal
// https://www.npmjs.com/package/hyper-pane
// https://www.npmjs.com/package/hyper-autoprofile
// https://www.npmjs.com/package/hyperlayout
// https://www.npmjs.com/package/hyper-stylesheet
// https://www.npmjs.com/package/hyper-hide-scroll
// https://www.npmjs.com/package/hypernasa

// TODO Tools
// https://www.npmjs.com/package/config-hyperterm
// https://www.npmjs.com/package/themer

// TODO Themes
// https://www.npmjs.com/package/hyper-chesterish
// https://www.npmjs.com/package/hyper-clean
// https://www.npmjs.com/package/hyper-firewatch
// https://www.npmjs.com/package/hyper-nord
// https://www.npmjs.com/package/hyper-oceans16
// https://www.npmjs.com/package/hyper-one-dark-vivid
// https://www.npmjs.com/package/hyper-relaxed
// https://www.npmjs.com/package/hyper-ramda
// https://www.npmjs.com/package/hyper-snazzy
// https://www.npmjs.com/package/hyperblue
// https://www.npmjs.com/package/hyperocean
// https://www.npmjs.com/package/hyperterm-base-16-ocean
// https://www.npmjs.com/package/hyperterm-firewatch
// https://www.npmjs.com/package/hyperterm-sourcerer

module.exports = {
  config: {
    // choose either `"stable"` for receiving highly polished,
    // or `"canary"` for less polished but more frequent updates
    updateChannel: "stable",

    // default font size in pixels for all tabs
    fontSize: 14,

    // font family with optional fallbacks
    fontFamily: `Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace`,

    // default font weight: "normal" or "bold"
    fontWeight: "normal",

    // font weight for bold characters: "normal" or "bold"
    fontWeightBold: "bold",

    // terminal cursor background color and opacity (hex, rgb, hsl, hsv, hwb or cmyk)
    cursorColor: "#FEED6C",

    // terminal text color under BLOCK cursor
    cursorAccentColor: "black",

    // `"BEAM"` for |, `"UNDERLINE"` for _, `"BLOCK"` for █
    cursorShape: "BEAM",

    // set to `true` (without backticks and without quotes) for blinking cursor
    cursorBlink: false,

    // color of the text
    foregroundColor: "whitesmoke",

    // terminal background color
    // opacity is only supported on macOS
    backgroundColor: "#111",

    // terminal selection color
    selectionColor: "rgba(254, 237, 108, 0.5)",

    // border color (window, tabs)
    borderColor: "#333",

    // custom CSS to embed in the main window
    css: "",

    // custom CSS to embed in the terminal window
    termCSS: "",

    // if you"re using a Linux setup which show native menus, set to false
    // default: `true` on Linux, `true` on Windows, ignored on macOS
    showHamburgerMenu: "",

    // set to `false` (without backticks and without quotes) if you want to hide the minimize, maximize and close buttons
    // additionally, set to `"left"` if you want them on the left, like in Ubuntu
    // default: `true` (without backticks and without quotes) on Windows and Linux, ignored on macOS
    showWindowControls: "",

    // custom padding (CSS format, i.e.: `top right bottom left`)
    padding: "0 14px",

    // the full list. if you're going to provide the full color palette,
    // including the 6 x 6 color cubes and the grayscale map, just provide
    // an array here instead of a color map object
    colors: {
      black: "#1B1D1E",
      red: "#F92672",
      green: "#36D48B",
      yellow: "#FEED6C",
      blue: "#268BD2",
      magenta: "#FF5995",
      cyan: "#56C2D6",
      white: "#f8f8f2",
      lightBlack: "#686868",
      lightRed: "#FD6F6B",
      lightGreen: "#67F86F",
      lightYellow: "#FFFA72",
      lightBlue: "#6A76FB",
      lightMagenta: "#FD7CFC",
      lightCyan: "#68FDFE",
      lightWhite: "#FFFFFF",
    },

    // the shell to run when spawning a new session (i.e. /usr/local/bin/fish)
    // if left empty, your system's login shell will be used by default
    //
    // Windows
    // - Make sure to use a full path if the binary name doesn't work
    // - Remove `--login` in shellArgs
    //
    // Bash on Windows
    // - Example: `C:\\Windows\\System32\\bash.exe`
    //
    // PowerShell on Windows
    // - Example: `C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`
    shell: "D:\\Tools\\Git\\git-cmd.exe",

    // for setting shell arguments (i.e. for using interactive shellArgs: `['-i']`)
    // by default `['--login']` will be used
    shellArgs: ["--command=usr/bin/bash.exe", "-l", "-i"],

    // for environment variables
    env: {
      TERM: "cygwin",
    },

    // set to `false` for no bell
    bell: "SOUND",

    // if `true` (without backticks and without quotes), selected text will automatically be copied to the clipboard
    copyOnSelect: true,

    // if `true` (without backticks and without quotes), hyper will be set as the default protocol client for SSH
    defaultSSHApp: true,

    // if `true` (without backticks and without quotes), on right click selected text will be copied or pasted if no
    // selection is present (`true` by default on Windows and disables the context menu feature)
    // quickEdit: true,

    // URL to custom bell
    // bellSoundURL: 'http://example.com/bell.mp3',

    // for advanced config flags please refer to https://hyper.is/#cfg
  },

  // a list of plugins to fetch and install from npm
  // format: [@org/]project[#version]
  // examples:
  //   `hyperpower`
  //   `@company/project`
  //   `project#1.0.1`
  plugins: [],

  // in development, you can create a directory under
  // `~/.hyper_plugins/local/` and include it here
  // to load it and avoid it being `npm install`ed
  localPlugins: [],

  keymaps: 
  {
    "window:devtools": "ctrl+shift+i",
    "window:reload": "ctrl+shift+r",
    "window:reloadFull": "ctrl+shift+f5",
    "window:preferences": "ctrl+,",
    "zoom:reset": "ctrl+0",
    "zoom:in": "ctrl+plus",
    "zoom:out": "ctrl+-",
    "window:new": "ctrl+shift+n",
    "window:minimize": "ctrl+shift+m",
    "window:zoom": "ctrl+shift+alt+m",
    "window:toggleFullScreen": "f11",
    "window:close": [
      "ctrl+shift+q",
      "alt+f4"
    ],
    "tab:new": "ctrl+t",
    "tab:next": [
      "ctrl+shift+]",
      "ctrl+shift+right",
      "ctrl+alt+right",
      "ctrl+tab"
    ],
    "tab:prev": [
      "ctrl+shift+[",
      "ctrl+shift+left",
      "ctrl+alt+left",
      "ctrl+shift+tab"
    ],
    "tab:jump:prefix": "ctrl",
    "pane:next": "ctrl+pageup",
    "pane:prev": "ctrl+pagedown",
    "pane:splitVertical": "ctrl+shift+d",
    "pane:splitHorizontal": "ctrl+shift+e",
    "pane:close": "ctrl+w",
    "editor:undo": "ctrl+shift+z",
    "editor:redo": "ctrl+shift+y",
    "editor:cut": "ctrl+shift+x",
    "editor:copy": "ctrl+shift+c",
    "editor:paste": "ctrl+shift+v",
    "editor:selectAll": "ctrl+shift+a",
    "editor:movePreviousWord": "ctrl+left",
    "editor:moveNextWord": "ctrl+right",
    "editor:moveBeginningLine": "home",
    "editor:moveEndLine": "end",
    "editor:deletePreviousWord": "ctrl+backspace",
    "editor:deleteNextWord": "ctrl+del",
    "editor:deleteBeginningLine": "ctrl+home",
    "editor:deleteEndLine": "ctrl+end",
    "editor:clearBuffer": "ctrl+shift+k",
    "editor:break": "ctrl+c",
    "plugins:update": "ctrl+shift+u"
  },
}
