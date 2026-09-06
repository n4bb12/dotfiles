import { isAbsolute, join, relative } from "node:path"

import type { ImageRef, ResolvedImage } from "./types.ts"

const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g

export function isRemoteDestination(dest: string) {
  if (dest.startsWith("/uploads/")) {
    return true
  }

  if (dest.startsWith("//")) {
    return true
  }

  return /^[a-z][a-z0-9+.-]{1,}:/i.test(dest)
}

export function parseLinkDestination(inside: string) {
  const trimmed = inside.trim()

  if (trimmed.startsWith("<")) {
    const end = trimmed.indexOf(">")

    if (end === -1) {
      return decodeDest(trimmed)
    }

    return decodeDest(trimmed.slice(1, end))
  }

  const space = trimmed.search(/\s/)
  const dest = space === -1 ? trimmed : trimmed.slice(0, space)

  return decodeDest(dest)
}

function decodeDest(dest: string) {
  try {
    return decodeURIComponent(dest)
  } catch {
    return dest
  }
}

export function findImageRefs(markdown: string) {
  const refs: ImageRef[] = []

  for (const match of markdown.matchAll(IMAGE_PATTERN)) {
    const full = match[0]
    const alt = match[1]
    const inside = match[2]
    const index = match.index

    if (typeof alt !== "string" || typeof inside !== "string" || typeof index !== "number") {
      continue
    }

    const dest = parseLinkDestination(inside)

    refs.push({
      alt,
      dest,
      full,
      start: index,
      end: index + full.length,
      kind: isRemoteDestination(dest) ? "remote" : "local",
    })
  }

  return refs
}

export function resolveImageRefs(markdown: string, mrDir: string) {
  return findImageRefs(markdown).map((ref) => resolveImageRef(ref, mrDir))
}

export function resolveImageRef(ref: ImageRef, mrDir: string): ResolvedImage {
  if (ref.kind === "remote") {
    return {
      ...ref,
      absPath: "",
      attachPath: "",
      exists: true,
    }
  }

  const absPath = isAbsolute(ref.dest) ? ref.dest : join(mrDir, ref.dest)
  const attachPath = toPosix(relative(mrDir, absPath) || absPath)

  return {
    ...ref,
    absPath,
    attachPath,
    exists: false,
  }
}

export function localImageRefs(refs: ResolvedImage[]) {
  return refs.filter((ref) => ref.kind === "local")
}

export function replaceLocalImageDestinations(markdown: string, replacements: Map<string, string>) {
  const refs = findImageRefs(markdown)
  let result = markdown

  for (const ref of [...refs].reverse()) {
    if (ref.kind !== "local") {
      continue
    }

    const next = replacements.get(ref.dest) ?? replacements.get(posixDest(ref.dest))

    if (typeof next !== "string") {
      continue
    }

    result = `${result.slice(0, ref.start)}![${ref.alt}](${next})${result.slice(ref.end)}`
  }

  return result
}

export function parseGitlabMarkdownUrl(markdown: string) {
  const match = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/)
  const url = match?.[1]

  if (typeof url !== "string" || !url) {
    return undefined
  }

  return parseLinkDestination(url)
}

function posixDest(dest: string) {
  return dest.replaceAll("\\", "/")
}

function toPosix(path: string) {
  return path.replaceAll("\\", "/")
}
