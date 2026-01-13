import { exec } from "node:child_process"
import { promisify } from "node:util"
import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google"
import { gateway, generateText } from "ai"

const execAsync = promisify(exec)

try {
  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) {
    console.error("Error: AI_GATEWAY_API_KEY environment variable is not set.")
    process.exit(1)
  }

  // 1. Get staged changes
  const { stdout: diff } = await execAsync("git diff --cached")

  if (!diff.trim()) {
    console.error("No staged changes found. Please stage your changes before committing.")
    process.exit(1)
  }

  // 3. Generate commit message
  const { text } = await generateText({
    model: gateway("google/gemini-2.5-flash-lite"),
    temperature: 0,
    prompt: `
    ### Task
    Write a concise one-line conventional git commit message for the following changes.
    Return only the commit message, no quotes, no explanations.

    ### Format
    \`<type>[optional scope]: <description>\`

    [optional body]

    [optional footer(s)]

    ### Rules
    - **Types**:
      - \`feat\`: New feature (maps to SemVer \`MINOR\`).
      - \`fix\`: Bug fix (maps to SemVer \`PATCH\`).
      - \`docs\`, \`style\`, \`refactor\`, \`perf\`, \`test\`, \`build\`, \`ci\`, \`chore\`, \`revert\`.
    - **Scope**: Optional noun describing the area of change (e.g., \`feat(ui):\`, \`fix(auth):\`).
    - **Description**: Use imperative, present tense (e.g., "add", not "added"). No period at the end.
    - **Breaking Changes**: Append a \`!\` after type/scope (e.g., \`feat!:\`) and/or include \`BREAKING CHANGE:\` in the footer.
    - **Body/Footer**: Use the body for "why" and footers for issue tracking (e.g., \`Fixes: #123\`).

    ### Example
    \`feat(convex): add mutation for user profile updates\`

    ### Changes
    ${diff}

    `.trim(),
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
          includeThoughts: false,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
  })

  // 4. Output the message
  console.log(text.trim())
} catch (error) {
  console.error("Error generating commit message:", error)
  process.exit(1)
}
