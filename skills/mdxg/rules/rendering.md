# Rendering

## 1. Theming

A conforming tool MUST adapt its appearance to the host environment.

- Background, foreground, accent, and border colors SHOULD be derived from the host theme or operating system
- The tool MUST NOT require the user to configure colors to achieve a usable appearance
- Both light and dark host themes MUST be supported
- MDXG does not define a color scheme, font, or visual style

## 2. Code Block Rendering

A conforming tool MUST render fenced code blocks with syntax highlighting in preview mode.

### 2.1 Requirements

- Fenced code blocks with a language identifier (e.g., ` ```js `) MUST be rendered with language-appropriate syntax highlighting
- Code blocks without a language identifier MUST still render as monospaced preformatted text
- A copy-to-clipboard button MUST be provided on each code block, allowing the user to copy the block's content with a single action
- The syntax highlighting color scheme MUST adapt to the host's light/dark theme (Section 1)

### 2.2 Implementation Examples

- Shiki, Prism, or highlight.js for token-based highlighting
- A "Copy" button that appears on hover or is always visible in the top-right corner of the block
- Language label displayed alongside the copy button

## 3. Task Lists

A conforming tool MUST render task list syntax as checkboxes in preview mode.

### 3.1 Requirements

- `- [ ]` MUST render as an unchecked checkbox
- `- [x]` MUST render as a checked checkbox
- Checkboxes MAY be interactive (toggling updates the underlying source) or MAY be read-only. This is an implementation decision
- Task lists MUST retain their list structure and indentation

### 3.2 Implementation Examples

- Native HTML `<input type="checkbox">` elements (disabled or enabled)
- Custom checkbox components with click handlers that edit the source

## 4. Images

A conforming tool MUST render images in preview mode with sensible defaults.

### 4.1 Requirements

- Images MUST be rendered inline with the document content
- Relative image paths (e.g., `![](./images/diagram.png)`) MUST be resolved relative to the document's location
- Images MUST be constrained to the content width. They MUST NOT overflow the content area horizontally
- Alt text MUST be preserved and accessible to assistive technology
- If an image fails to load, the alt text SHOULD be displayed as a fallback

### 4.2 Implementation Examples

- `max-width: 100%` on `<img>` elements
- Lazy loading for images below the fold
- Click-to-zoom for large images

## 5. Tables

A conforming tool MUST render markdown tables in preview mode.

### 5.1 Requirements

- Tables MUST render with visible cell borders or equivalent visual separation
- Header rows MUST be visually distinguished from body rows (e.g., bold text, background color)
- Column alignment specified in the markdown (`---`, `:---`, `:---:`, `---:`) MUST be respected
- Tables wider than the content area MUST be horizontally scrollable. They MUST NOT break the page layout

### 5.2 Implementation Examples

- `overflow-x: auto` on a table wrapper
- Sticky header rows on long tables
- Responsive table layouts that stack columns on small screens
