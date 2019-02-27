import generateNodeAliases from "./node-aliases"
import generateWebGoogle from "./web-google"
import generateWebIds from "./web-ids"
import generateWebRefs from "./web-refs"
import generateWebResources from "./web-resources"
import generateWebSearch from "./web-search"
import generateWebSites from "./web-sites"
import generateWebTools from "./web-tools"

import generateIndex from "."

async function generate() {
  await generateNodeAliases()
  await generateWebGoogle()
  await generateWebIds()
  await generateWebRefs()
  await generateWebResources()
  await generateWebSearch()
  await generateWebSites()
  await generateWebTools()
  await generateIndex()
}

generate()
