import { describe, expect, test } from "bun:test"
import { isClientCode } from "./use-client.js"

function detect(file: string, content: string) {
  return isClientCode(file, content, content.split("\n"))
}

describe("detectEnvironment", () => {
  test("marks static tsx as server", () => {
    expect(
      detect(
        "src/app/page.tsx",
        `export default function Page() {
  return <main>Hello</main>
}`,
      ),
    ).toBe(false)
  })

  test("marks hook usage as client", () => {
    expect(
      detect(
        "src/components/counter.tsx",
        `import { useState } from "react"

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}`,
      ),
    ).toBe(true)
  })

  test("marks jsx handlers without hooks as client", () => {
    expect(
      detect(
        "src/components/button.tsx",
        `export function Button() {
  return <button type="button" onClick={() => {}}>Click</button>
}`,
      ),
    ).toBe(true)
  })

  test("does not treat type-only onClick as client", () => {
    expect(
      detect(
        "src/components/types.tsx",
        `type Props = {
  onClick?: () => void
}

export function Box(props: Props) {
  return <div>{props.children}</div>
}`,
      ),
    ).toBe(false)
  })

  test("marks custom hook usage as client", () => {
    expect(
      detect(
        "src/components/profile.tsx",
        `import { useProfile } from "src/hooks/use-profile"

export function Profile() {
  const profile = useProfile()
  return <p>{profile.name}</p>
}`,
      ),
    ).toBe(true)
  })

  test("keeps useId on the server", () => {
    expect(
      detect(
        "src/components/label.tsx",
        `import { useId } from "react"

export function Label() {
  const id = useId()
  return <label htmlFor={id}>Name</label>
}`,
      ),
    ).toBe(false)
  })

  test("keeps use() on the server", () => {
    expect(
      detect(
        "src/components/user.tsx",
        `import { use } from "react"

export function User({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)
  return <p>{user.name}</p>
}`,
      ),
    ).toBe(false)
  })

  test("marks next/headers imports as server", () => {
    expect(
      detect(
        "src/app/actions.ts",
        `import { cookies } from "next/headers"

export async function getSession() {
  return cookies().get("session")
}`,
      ),
    ).toBe(false)
  })

  test("ignores custom hooks in ts files", () => {
    expect(
      detect(
        "src/hooks/use-thing.ts",
        `import { useEffect, useState } from "react"

export function useThing() {
  const [value, setValue] = useState("")
  useEffect(() => {}, [])
  return value
}`,
      ),
    ).toBe(false)
  })

  test('does not treat "document" string literals as client', () => {
    expect(
      detect(
        "src/schemaTypes/sections/featureComparison.tsx",
        `export const featureComparisonType = defineType({
  name: "featureComparison",
  type: "document",
})`,
      ),
    ).toBe(false)
  })

  test("marks document property access as client", () => {
    expect(
      detect(
        "src/components/theme.tsx",
        `export function ThemeColor() {
  return document.documentElement.dataset.theme
}`,
      ),
    ).toBe(true)
  })

  test("leaves plain ts utils without a directive", () => {
    expect(
      detect(
        "src/lib/format.ts",
        `export function formatName(name: string) {
  return name.trim()
}`,
      ),
    ).toBe(false)
  })
})
