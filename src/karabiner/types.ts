import { key } from "./key"
import { ValueOf } from "type-fest"
import { button } from "./button"

export type Key = ValueOf<typeof key>

export type Button = ValueOf<typeof button>

export type Keymap = Partial<Record<Key, Key>>

export type RuleFrom = {
  modifiers?: {
    mandatory?: Key[]
    optional?: Key[]
  }
  key_code?: Key
  pointing_button?: Button
  simultaneous_options?: {
    detect_key_down_uninterruptedly?: boolean
    key_down_order?: "insensitive" | "strict" | "strict_inverse"
    key_up_order?: "insensitive" | "strict" | "strict_inverse"
    key_up_when?: "any" | "all"
    to_after_key_up?: any[]
  }
}

export type RuleTo = {
  modifiers?: Key[]
  key_code?: Key
  pointing_button?: Button
  shell_command?: string
  repeat?: boolean
  halt?: boolean
  lazy?: boolean
}

export type RuleConditions = any

export type Rule = {
  from: RuleFrom
  to?: RuleTo
  to_if_alone?: RuleTo
  to_if_held_down?: RuleTo
  conditions?: RuleConditions
}
