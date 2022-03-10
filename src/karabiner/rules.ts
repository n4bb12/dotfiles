import { key } from "./key"
import { Key, Rule } from "./types"
import { button } from "./button"

const alphabet = [
  ..."abcdefghijklmnopqrstuvwxyz1234567890",
  "slash" /* - */,
  "close_bracket" /* + */,
  "hyphen" /* ß */,
  "equap_sign" /* ´ */,
]
const inFinder = { type: "frontmost_application_if", bundle_identifiers: ["^com.apple.finder"] }

export const rules: Rule[] = [
  // COMMANDS

  ...alphabet.map((character) => ({
    from: { modifiers: { mandatory: [key.control], optional: [key.any] }, key_code: character as Key },
    to: { modifiers: [key.left_command], key_code: character as Key },
  })),
  ...alphabet.map((character) => ({
    from: { modifiers: { mandatory: [key.command], optional: [key.any] }, key_code: character as Key },
    to: { modifiers: [key.left_control], key_code: character as Key },
  })),

  // TEXT NAVIGATION

  {
    from: { key_code: key.home },
    to: { modifiers: [key.left_command], key_code: key.arrow_left },
  },
  {
    from: { key_code: key.end },
    to: { modifiers: [key.left_command], key_code: key.arrow_right },
  },
  {
    from: { modifiers: { mandatory: [key.shift] }, key_code: key.home },
    to: { modifiers: [key.left_command, key.left_shift], key_code: key.arrow_left },
  },
  {
    from: { modifiers: { mandatory: [key.shift] }, key_code: key.end },
    to: { modifiers: [key.left_command, key.left_shift], key_code: key.arrow_right },
  },
  {
    from: { modifiers: { mandatory: [key.control], optional: [key.shift] }, key_code: key.home },
    to: { modifiers: [key.left_command], key_code: key.arrow_up },
  },
  {
    from: { modifiers: { mandatory: [key.control], optional: [key.shift] }, key_code: key.end },
    to: { modifiers: [key.left_command], key_code: key.arrow_down },
  },
  {
    from: { modifiers: { mandatory: [key.control], optional: [key.shift] }, key_code: key.arrow_left },
    to: { modifiers: [key.left_option], key_code: key.arrow_left },
  },
  {
    from: { modifiers: { mandatory: [key.control], optional: [key.shift] }, key_code: key.arrow_right },
    to: { modifiers: [key.left_option], key_code: key.arrow_right },
  },
  {
    from: { modifiers: { mandatory: [key.alt], optional: [key.shift] }, key_code: key.arrow_left },
    to: { modifiers: [key.left_control], key_code: key.arrow_left },
  },
  {
    from: { modifiers: { mandatory: [key.alt], optional: [key.shift] }, key_code: key.arrow_right },
    to: { modifiers: [key.left_control], key_code: key.arrow_right },
  },

  // FOCUS MANAGEMENT

  {
    from: { modifiers: { mandatory: [key.command] }, key_code: key.tab },
    to: { key_code: key.f2 },
  },
  {
    from: { modifiers: { mandatory: [key.command] }, key_code: key.f },
    to: { key_code: key.f6 },
  },
  {
    from: { modifiers: { mandatory: [key.command] }, key_code: key.e },
    to: { key_code: key.f7 },
  },
  {
    from: { modifiers: { mandatory: [key.option], optional: [key.any] }, key_code: key.tab },
    to: { modifiers: [key.left_command], key_code: key.tab },
  },
  {
    from: { modifiers: { mandatory: [key.option, key.shift], optional: [key.any] }, key_code: key.tab },
    to: { modifiers: [key.left_command, key.left_shift], key_code: key.tab },
  },

  // FUNCTION KEYS

  {
    from: { modifiers: { mandatory: [key.alt] }, key_code: key.f4 },
    to: { modifiers: [key.left_command], key_code: key.q },
  },
  {
    from: { modifiers: { optional: [key.any] }, key_code: key.f5 },
    to: { modifiers: [key.left_command], key_code: key.r },
  },

  // KEY COMBINATIONS

  {
    from: { modifiers: { mandatory: [key.control, key.alt] }, key_code: key.delete_forward },
    to: { shell_command: "open -a 'Activity Monitor.app'" },
  },
  {
    from: { modifiers: { mandatory: [key.command] }, key_code: key.l },
    to: { modifiers: [key.left_control, key.left_command], key_code: key.q },
  },

  // MOUSE

  // {
  //   from: { key_code: key.left_control },
  //   to: { key_code: key.left_control },
  //   to_if_held_down: { key_code: key.left_command },
  // },
  {
    from: { modifiers: { mandatory: [key.control], optional: [key.any] }, pointing_button: button.left },
    to: { modifiers: [key.left_command], pointing_button: button.left },
  },

  // FINDER

  {
    from: { key_code: key.backspace },
    to: { modifiers: [key.left_command], key_code: key.arrow_up },
    conditions: [inFinder],
  },
  {
    from: { modifiers: { optional: [key.any] }, key_code: key.delete_forward },
    to: { modifiers: [key.left_command], key_code: key.backspace },
    conditions: [inFinder],
  },
  {
    from: { key_code: key.f2 },
    to: { key_code: key.enter },
    conditions: [inFinder],
  },
  {
    from: { modifiers: { optional: [key.any] }, key_code: key.enter },
    to: { modifiers: [key.right_command], key_code: key.o },
    conditions: [inFinder],
  },
]
