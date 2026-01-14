import { exec } from "node:child_process"
import { promisify } from "node:util"
import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { type GatewayModelId, gateway, generateText } from "ai"

const execAsync = promisify(exec)

const model: GatewayModelId = "google/gemini-3-flash-preview"
const temperature = 0
const providerOptions = {
  // https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#thinking
  thinkingConfig: {
    thinkingLevel: "minimal",
    includeThoughts: false,
  },
} satisfies GoogleGenerativeAIProviderOptions

const instructions = `
### Task
Write a concise one-line conventional git commit message for the changes below.
Return only the commit message, no quotes, no explanations.
Take into account the context of the changes to determine what was changed.

### Format
\`<type>[optional scope]: <description>\`

### Rules
- **Types**:
  - \`feat\`: New feature (maps to SemVer \`MINOR\`).
  - \`fix\`: Bug fix (maps to SemVer \`PATCH\`).
  - \`docs\`, \`style\`, \`refactor\`, \`perf\`, \`test\`, \`build\`, \`ci\`, \`chore\`, \`revert\`.
- **Scope**: Optional noun describing the area of change (e.g., \`feat(ui):\`, \`fix(auth):\`).
- **Description**: Use imperative, present tense (e.g., "add", not "added"). No period at the end.

### Example
\`feat(convex): add mutation for user profile updates\`

### Changes
`.trim()

function getModel() {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

  if (OPENROUTER_API_KEY) {
    return createOpenRouter({ apiKey: OPENROUTER_API_KEY })(model)
  }

  const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY

  if (AI_GATEWAY_API_KEY) {
    return gateway(model)
  }

  throw new Error(
    "Error: No AI API key found. Please set either OPENROUTER_API_KEY or AI_GATEWAY_API_KEY environment variable.",
  )
}

// 1. Get staged changes
const { stdout: diff } = await execAsync("git diff --cached")

if (!diff.trim()) {
  throw new Error("No staged changes found. Please stage your changes before committing.")
}

const prompt = [instructions, diff].join("\n\n")

// 3. Generate commit message
const { text } = await generateText({
  model: getModel(),
  temperature: temperature,
  prompt: prompt,
  providerOptions: {
    google: providerOptions,
  },
})

// 4. Output the message
console.log(text.trim())
