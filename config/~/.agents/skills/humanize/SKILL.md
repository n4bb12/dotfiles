---
name: humanize
description: Use when the user wants to humanize text, rewrite text to sound natural and human, remove AI artifacts or padding, make text clear/direct/conversational, or provides source text along with "humanize", "make this sound like a person wrote it", "revise for voice", etc.
argument-hint: "source text [; audience/tone/key terms/length prefs]"
---

# Humanize

Transform source text so it reads like a person wrote it: clear, direct, unpadded, and in a voice someone would actually use.

**The deliverable is the revised text — not commentary about the revision.**

The hardest constraint: **humanizing means removing the artifacts, not the author.** If the source has a voice, the output should sound like that person on a good day, not a different, blander person.

## Input

- **Source text** (required).
- **Audience / Tone preferences / Key terms / Target length** (optional, provided by user).

Key terms survive the edit verbatim; everything else is negotiable.

## Guidelines

1. **Focus on clarity** — every sentence understandable on first read.
2. **Be direct and concise** — get to the point; cut words that don't earn their place.
3. **Use simple language** — short sentences, plain words; complexity only where the idea is complex.
4. **Avoid fluff** — adjectives and adverbs must add information, not enthusiasm.
5. **Avoid marketing hype** — no over-promising, no buzzwords. "This product can help you," not "this revolutionary product will transform your life."
6. **Keep it real** — honest beats friendly-sounding; no forced warmth or exaggeration.
7. **Natural, conversational tone** — starting sentences with "And" or "But" is fine.
8. **Relaxed grammar where it fits the voice** — informality is allowed when it matches the register; don't sand a casual draft into corporate polish.
9. **Avoid AI-giveaway phrases** — "dive into," "unleash," "game-changing," "in today's fast-paced world," "it's worth noting," "delve," "tapestry," "realm," "crucial," "seamlessly," "robust," and kin.
10. **Vary sentence structure** — mix short, medium, and long; monotony reads as machine.
11. **Address readers directly** where the form allows — "you" and "your."
12. **Active voice** by default; passive only when the actor genuinely doesn't matter.
13. **Cut filler phrases** — "It's important to note that the deadline is approaching" → "The deadline is approaching."
14. **Remove clichés, jargon, hashtags, and decorative emoji** — and most semicolons.
15. **Hedge only when genuinely unsure** — when sure, say "this helps," not "this might help." When honestly uncertain, keep the hedge; false confidence is its own AI tell.
16. **Eliminate redundancy** — one idea, said once, well.
17. **No forced keyword placement** — key terms appear where they'd naturally fall.

## Process

1. Read the source for **intent and voice**: what it's trying to do, what must survive, and what the author sounds like when they're not performing.
2. Apply the guidelines in one pass — structure first (cut redundancy, reorder for directness), then sentences, then words.
3. Check against **Target length** and **Tone preferences** if given.
4. Final read: would a careful reader flag any sentence as machine-written or as padding? Fix those. Then stop — over-editing past this point starts removing the author.

## Discipline

- **Meaning is invariant.** If a cut changes what the text claims, restore it. Concision that alters commitments is a bug.
- **Don't flatten voice into "clean."** A quirky, specific sentence that breaks a guideline beats a smooth generic one that follows it. The guidelines serve the voice, not the reverse.
- Deliver the revised text first. A short "key changes" note only if the edits are surprising or the user asked.

## Output

Output the humanized version directly. Do not wrap it in quotes, code fences, or add a preamble unless the user explicitly asked for explanation.

If the user provided constraints (audience, tone, key terms, length), honor them while applying the guidelines.
