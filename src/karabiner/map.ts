import console from "console"
import { key } from "./key"
import { RuleFrom, Key, Keymap, Rule, RuleTo } from "./types"

export const devices = {
  appleInternalKeyboard: 835,
  g815MechanicalKeyboard: 49983,
}

export const winToMac: Keymap = {
  [key.win]: key.command,
  [key.left_win]: key.left_command,
  [key.right_win]: key.right_command,

  [key.alt]: key.option,
  [key.left_alt]: key.left_option,
  [key.right_alt]: key.right_option,
}

function mapWinToMac(key: Key) {
  return winToMac[key] || key
}

function mapKey([from, to]: [Key, Key]) {
  return {
    from: { key_code: from },
    to: [{ key_code: to }],
  }
}

export function mapKeys(keymap: Keymap) {
  return Object.entries(keymap)
    .map(([from, to]) => [mapWinToMac(from as any), mapWinToMac(to)])
    .filter(([from, to]) => from !== to)
    .map(([from, to]) => mapKey([from, to] as any))
}

export const ruleKeyMap: Keymap = {
  [key.win]: key.control,
  [key.left_win]: key.left_control,
  [key.right_win]: key.right_control,

  [key.alt]: key.option,
  [key.left_alt]: key.left_option,
  [key.right_alt]: key.right_option,
}

function mapKeyForRule(key: Key | undefined) {
  if (!key) return
  return ruleKeyMap[key] || key
}

function buildRuleFrom(from: Rule["from"]) {
  const mandatory = from.modifiers?.mandatory?.map(mapKeyForRule)
  const optional = from.modifiers?.optional?.map(mapKeyForRule)
  return {
    modifiers: mandatory || optional ? { mandatory, optional } : undefined,
    key_code: mapKeyForRule(from.key_code),
    pointing_button: from.pointing_button,
    simultaneous_options: from.simultaneous_options,
  }
}

function buildRuleTo(to: RuleTo) {
  return [
    {
      modifiers: to.modifiers?.map(mapKeyForRule),
      key_code: mapKeyForRule(to.key_code),
      pointing_button: to.pointing_button,
      shell_command: to.shell_command,
      repeat: to.repeat,
      halt: to.halt,
      lazy: to.lazy,
    },
  ]
}

function buildDescrFrom(from: RuleFrom) {
  return [
    ...(from.modifiers?.mandatory || []),
    ...(from.modifiers?.optional?.map((key) => `(${key})`) || []),
    from.key_code,
    from.pointing_button,
  ]
    .filter(Boolean)
    .join(" + ")
}

function buildDescrTo(to: RuleTo) {
  return [...(to.modifiers || []), to.key_code, to.pointing_button, to.shell_command].filter(Boolean).join(" + ")
}

function buildForwardRules(rules: Rule[]) {
  return rules.map((rule) => {
    const { from, to, to_if_alone, to_if_held_down, conditions } = rule
    const descrFrom = buildDescrFrom(from)
    const descrTo = to ? buildDescrTo(to) : ""
    const descrToIfAlone = to_if_alone ? `[alone: ${buildDescrTo(to_if_alone)}]` : ""
    const descrToIfHeld = to_if_held_down ? `[held: ${buildDescrTo(to_if_held_down)}]` : ""
    const description = descrFrom + " --> " + [descrTo, descrToIfAlone, descrToIfHeld].filter(Boolean).join(", ")
    console.log(description)

    const manipulator = {
      type: "basic",
      from: buildRuleFrom(from),
      to: to ? buildRuleTo(to) : undefined,
      to_if_alone: to_if_alone ? buildRuleTo(to_if_alone) : undefined,
      to_if_held_down: to_if_held_down ? buildRuleTo(to_if_held_down) : undefined,
      conditions: conditions,
    }

    return {
      description,
      manipulators: [manipulator],
    }
  })
}

function buildBackwardRules(rules: Rule[]) {
  const reversedRules = rules
    .map((rule) => {
      const { from, to, to_if_alone, to_if_held_down, conditions } = rule

      if (!to?.key_code && !to_if_alone?.key_code && !to_if_held_down?.key_code) {
        return
      }

      const reverseTo: RuleTo = {
        modifiers: from.modifiers?.mandatory,
        key_code: from.key_code,
        pointing_button: from?.pointing_button,
      }

      const reversed: Rule = {
        ...rule,
        from: {
          modifiers: {
            optional: from?.modifiers?.optional,
            mandatory: to?.modifiers,
          },
          key_code: to?.key_code,
          pointing_button: to?.pointing_button,
          simultaneous_options: from.simultaneous_options,
        },
        to: to ? reverseTo : undefined,
        to_if_alone: to_if_alone ? reverseTo : undefined,
        to_if_held_down: to_if_held_down ? reverseTo : undefined,
        conditions,
      }
      return reversed
    })
    .filter(Boolean) as Rule[]

  return buildForwardRules(reversedRules)
}

export function buildRules(rules: Rule[]) {
  return [
    //
    ...buildForwardRules(rules),
    ...buildBackwardRules(rules),
  ]
}
