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
    prompt: `
    Write a concise one-line conventional git commit message for the following changes.
    Return ONLY the commit message, no quotes, no explanations.

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
