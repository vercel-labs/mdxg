# Editing

## 11. Mode Toggle

A conforming tool MUST support at least two modes and provide a way to switch between them:

### 11.1 Preview Mode

- The content area MUST display the rendered HTML of the active page only (not the full document)
- The page title MUST be displayed prominently
- Standard markdown elements MUST be rendered: paragraphs, headings, lists, code blocks, tables, blockquotes, images, links, horizontal rules
- In-page headings (H3–H6) MUST have stable, linkable identifiers

### 11.2 Source View

- The content area MUST display the raw markdown text of the **full document** (not just the active page)
- Syntax highlighting SHOULD be provided for markdown constructs: headings, bold, italic, inline code, fenced code blocks, links, blockquotes, and list markers
- The text MAY be read-only

### 11.3 Source Edit

A conforming MDXG Editor (see Conformance) MUST support editable source mode in addition to source view:

- The text MUST be editable
- Edits MUST be synced back to the underlying document

### 11.4 Toggle Behavior

- Switching modes MUST NOT open a new tab, window, or panel. The transition happens in place
- The active mode MUST be clearly indicated
- Page navigation and page outline MAY remain available in source mode, or MAY be hidden. This is an implementation decision

## 12. Document Links

When the user activates a link to another markdown file (e.g., `[see spec](SPEC.md)`), a conforming tool SHOULD open that file using the same MDXG-conforming viewer/editor, rather than falling back to a plain text view or external application.

### 12.1 Requirements

- If the link includes a fragment (e.g., `SPEC.md#virtual-pages`), the tool SHOULD navigate to the referenced heading or page within the target document
- If the target file does not exist or cannot be opened, the tool SHOULD indicate the error to the user. It MUST NOT crash or navigate to an empty state silently
- Links MUST be resolved relative to the current document's location
- Only links to local markdown files are in scope. External URLs (e.g., `https://...`) SHOULD be handled by the host environment's default behavior
