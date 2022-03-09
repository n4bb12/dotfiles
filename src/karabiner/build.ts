import { readFile, writeFile } from "fs/promises"
import { devices, mapKeys, buildRules } from "./map"
import { macRemap, winRemap } from "./modifier_map"
import { rules } from "./rules"

const karabinerConfigFile = process.env.HOME + "/.config/karabiner/karabiner.json"

async function readConfig() {
  const json = await readFile(karabinerConfigFile, "utf8")
  return JSON.parse(json)
}

async function writeConfig(config: any) {
  const json = JSON.stringify(config, null, 2)
  await writeFile(karabinerConfigFile, json, "utf8")
}

async function main() {
  const config = await readConfig()

  const profile = config.profiles[0]
  const macDevice = config.profiles[0].devices.find(
    (device: any) => device.identifiers.product_id === devices.appleInternalKeyboard,
  )
  const winDevice = config.profiles[0].devices.find(
    (device: any) => device.identifiers.product_id === devices.g815MechanicalKeyboard,
  )

  profile.complex_modifications.rules = buildRules(rules)
  macDevice.simple_modifications = mapKeys(macRemap)
  winDevice.simple_modifications = mapKeys(winRemap)

  await writeConfig(config)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
