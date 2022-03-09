import { key } from "./key"
import { Keymap } from "./types"

// Symbol           Mac Keyboard        Windows Keyboard
// ⌘                Command key         Windows/Start key
// ⌥                Option key          Alt key
// ⋀                Control key         Ctrl key
// ⇧                Shift key           Shift key
// ⇪                Caps Lock           key  Caps Lock key
// ⌫                Delete key          Backspace key
// ⎋                Esc key             Esc key
// fn               Function key        Function key

export const macRemap: Keymap = {
  // [key.control]: key.command,
  // [key.left_control]: key.left_command,
  // [key.right_control]: key.right_command,
  // [key.option]: key.control,
  // [key.left_option]: key.left_control,
  // [key.right_option]: key.right_control,
  // [key.command]: key.option,
  // [key.left_command]: key.left_option,
  // [key.right_command]: key.right_option,
}

export const winRemap: Keymap = {
  // [key.control]: key.command,
  // [key.left_control]: key.left_command,
  // [key.right_control]: key.right_command,
  // [key.win]: key.control,
  // [key.left_win]: key.left_control,
  // [key.right_win]: key.right_control,
  // [key.alt]: key.option,
  // [key.left_alt]: key.left_option,
  // [key.right_alt]: key.right_option,
}
