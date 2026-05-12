---
name: mdxg
description: Markdown Experience Guidelines (MDXG) — a specification for
  how interfaces should present, navigate, and edit markdown documents.
  Use when building or reviewing markdown viewers/editors, implementing
  MDXG Viewer or MDXG Editor conformance, adding virtual pages, page
  navigation, page outline, search, preview/source mode toggle, or when
  the user mentions MDXG, "markdown experience guidelines", or references
  the vercel-labs/mdxg spec.
---

# MDXG — Markdown Experience Guidelines

## Usage

The spec is split into domain files under `rules/` for targeted loading:

1. `rules/rendering.md` — §1-5 (theming, code, task lists, images, tables)
2. `rules/document-structure.md` — §6-10 (virtual pages, nav, outline, search)
3. `rules/editing.md` — §11-12 (mode toggle, document links)
4. `rules/accessibility.md` — §13 (keyboard navigation)
5. `rules/extensions.md` — §14-16 (math, diagrams, footnotes)

## Conformance

Pick a target: **MDXG Viewer** (read-only) or **MDXG Editor** (full).
The spec source is at https://github.com/vercel-labs/mdxg. Extensions are SHOULD-level.
