# Extensions

The capabilities in this section are SHOULD-level. They enhance the reading experience but are not part of standard CommonMark syntax. Implementations are encouraged to support them where feasible.

## 14. Math Rendering

Inline math and display math SHOULD be rendered using a math typesetting engine.

### 14.1 Requirements

- Inline math delimited by `$...$` SHOULD be rendered inline with the surrounding text
- Display math delimited by `$$...$$` SHOULD be rendered as a centered block
- If math rendering is not supported, the raw syntax MUST be preserved as-is. It MUST NOT be stripped, hidden, or garbled
- The math rendering style SHOULD adapt to the host's font size and color scheme

### 14.2 Implementation Examples

- KaTeX for fast client-side rendering
- MathJax for broader LaTeX coverage
- Server-side rendering to SVG or MathML

## 15. Diagram Rendering

Fenced code blocks with diagram language identifiers SHOULD be rendered as visual diagrams in preview mode.

### 15.1 Requirements

- At minimum, ` ```mermaid ` blocks SHOULD be supported
- Other diagram languages (e.g., `plantuml`, `d2`, `graphviz`) MAY also be supported
- If diagram rendering is not supported for a given language, the block MUST fall back to a standard syntax-highlighted code block (Section 2)
- Rendered diagrams SHOULD adapt to the host's color scheme

### 15.2 Implementation Examples

- Mermaid.js for client-side rendering
- Server-side rendering via CLI tools
- Interactive diagrams with zoom/pan

## 16. Footnotes

Footnote syntax SHOULD be rendered as linked footnotes with back-references.

### 16.1 Requirements

- Footnote references (`[^1]`, `[^note]`) SHOULD render as superscript links that jump to the footnote definition
- Footnote definitions (`[^1]: ...`) SHOULD render at the bottom of the page with back-links to each reference
- If footnotes are not supported, the raw syntax MUST be preserved as-is. It MUST NOT be stripped or hidden

### 16.2 Implementation Examples

- Superscript numbers that link to a footnote section at the page bottom
- Tooltip/popover previews on hover
- Sidenotes in wide layouts
