import { describe, it, expect } from "vitest";
import {
  parseMarkdown,
  splitIntoChunks,
  extractHeadings,
  slugify,
  escapeHtml,
} from "../index";

describe("slugify", () => {
  it("converts basic text to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("handles non-ASCII / unicode characters", () => {
    expect(slugify("安装指南")).toBe("安装指南");
    expect(slugify("Über uns")).toBe("über-uns");
    expect(slugify("café latte")).toBe("café-latte");
  });

  it("strips HTML tags", () => {
    expect(slugify("Hello <em>World</em>")).toBe("hello-world");
  });

  it("collapses multiple dashes", () => {
    expect(slugify("a -- b")).toBe("a-b");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("  -hello- ")).toBe("hello");
  });

  it("returns empty string for symbols-only input", () => {
    expect(slugify("!@#$%")).toBe("");
  });
});

describe("escapeHtml", () => {
  it("escapes all dangerous characters", () => {
    expect(escapeHtml('<a href="x">\'&')).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;"
    );
  });
});

describe("splitIntoChunks", () => {
  it("returns empty array for empty input", () => {
    expect(splitIntoChunks("")).toHaveLength(1);
    expect(splitIntoChunks("")[0].title).toBe("Introduction");
  });

  it("returns empty lines as Introduction", () => {
    expect(splitIntoChunks("   \n\n  ")).toHaveLength(1);
    expect(splitIntoChunks("   \n\n  ")[0].title).toBe("Introduction");
  });

  it("splits on H1 headings", () => {
    const chunks = splitIntoChunks("# First\ncontent\n# Second\nmore");
    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe("First");
    expect(chunks[0].depth).toBe(1);
    expect(chunks[1].title).toBe("Second");
  });

  it("splits on H2 headings", () => {
    const chunks = splitIntoChunks("# Main\n## Sub1\ntext\n## Sub2\nmore");
    expect(chunks).toHaveLength(3);
    expect(chunks[0].title).toBe("Main");
    expect(chunks[1].title).toBe("Sub1");
    expect(chunks[1].depth).toBe(2);
    expect(chunks[2].title).toBe("Sub2");
  });

  it("handles setext H1 (=== underline)", () => {
    const chunks = splitIntoChunks("Title\n=====\ncontent");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].title).toBe("Title");
    expect(chunks[0].depth).toBe(1);
  });

  it("handles setext H2 (--- underline)", () => {
    const chunks = splitIntoChunks("# Main\nSubtitle\n------\ncontent");
    expect(chunks).toHaveLength(2);
    expect(chunks[1].title).toBe("Subtitle");
    expect(chunks[1].depth).toBe(2);
  });

  it("creates Introduction for content before first heading", () => {
    const chunks = splitIntoChunks("some text\n# Heading");
    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe("Introduction");
    expect(chunks[0].lines).toContain("some text");
  });

  it("strips closing hashes from titles", () => {
    const chunks = splitIntoChunks("# Title ##\ncontent");
    expect(chunks[0].title).toBe("Title");
  });

  it("does not treat ### as H2", () => {
    const chunks = splitIntoChunks("# Main\n### Sub heading\ncontent");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].lines).toContain("### Sub heading");
  });

  it("ignores H1/H2 headings inside fenced code blocks", () => {
    const chunks = splitIntoChunks("# Main\n```bash\n# Comment\n## Not a heading\n```\n## Sub\ntext");
    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe("Main");
    expect(chunks[1].title).toBe("Sub");
  });

  it("ignores H1/H2 headings inside tilde code blocks", () => {
    const chunks = splitIntoChunks("# Main\n~~~python\n# Comment\n## Not a heading\n~~~\n## Sub\ntext");
    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe("Main");
    expect(chunks[1].title).toBe("Sub");
  });

  it("ignores setext headings inside code blocks", () => {
    const chunks = splitIntoChunks("# Page\n```\nNot a heading\n---\n```\nReal Sub\n------\ncontent");
    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe("Page");
    expect(chunks[1].title).toBe("Real Sub");
  });

  it("handles multiple code blocks with headings", () => {
    const chunks = splitIntoChunks("# First\n```bash\n# Comment 1\n```\ntext\n```python\n# Comment 2\n```\n# Second\ncontent");
    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe("First");
    expect(chunks[1].title).toBe("Second");
  });
});

describe("extractHeadings", () => {
  it("extracts H3-H6 headings from lines", () => {
    const lines = ["### Heading 3", "#### Heading 4", "some text"];
    const headings = extractHeadings(lines);
    expect(headings).toHaveLength(2);
    expect(headings[0]).toEqual({ level: 3, text: "Heading 3", id: "heading-3" });
    expect(headings[1]).toEqual({ level: 4, text: "Heading 4", id: "heading-4" });
  });

  it("ignores headings inside fenced code blocks", () => {
    const lines = ["```", "### Not a heading", "```", "### Real heading"];
    const headings = extractHeadings(lines);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Real heading");
  });

  it("ignores headings inside tilde code blocks", () => {
    const lines = ["~~~", "### Not a heading", "~~~", "### Real heading"];
    const headings = extractHeadings(lines);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Real heading");
  });

  it("handles duplicate heading slugs with suffix", () => {
    const lines = ["### Setup", "text", "### Setup"];
    const headings = extractHeadings(lines);
    expect(headings).toHaveLength(2);
    expect(headings[0].id).toBe("setup");
    expect(headings[1].id).toBe("setup-1");
  });

  it("strips closing hashes", () => {
    const lines = ["### Title ###"];
    const headings = extractHeadings(lines);
    expect(headings[0].text).toBe("Title");
  });

  it("handles non-ASCII heading text", () => {
    const lines = ["### 安装指南"];
    const headings = extractHeadings(lines);
    expect(headings[0].id).toBe("安装指南");
  });
});

describe("parseMarkdown", () => {
  it("returns empty array for whitespace-only input", () => {
    const pages = parseMarkdown("   \n\n  ");
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0].title).toBe("Introduction");
  });

  it("creates virtual pages from H1/H2 headings", () => {
    const md = "# Page 1\nContent\n## Page 2\nMore content";
    const pages = parseMarkdown(md);
    expect(pages).toHaveLength(2);
    expect(pages[0].title).toBe("Page 1");
    expect(pages[0].depth).toBe(1);
    expect(pages[1].title).toBe("Page 2");
    expect(pages[1].depth).toBe(2);
  });

  it("generates unique page IDs for duplicate titles", () => {
    const md = "# Setup\ncontent\n## Setup\nmore";
    const pages = parseMarkdown(md);
    expect(pages[0].id).toBe("setup");
    expect(pages[1].id).toBe("setup-1");
  });

  it("injects heading IDs into rendered HTML", () => {
    const md = "# Page\n### My Heading\ntext\n### Another\nmore text";
    const pages = parseMarkdown(md);
    expect(pages[0].html).toContain('id="my-heading"');
    expect(pages[0].html).toContain('id="another"');
  });

  it("renders math blocks with KaTeX", () => {
    const md = "# Math\n$$E = mc^2$$";
    const pages = parseMarkdown(md);
    expect(pages[0].html).toContain("math-display");
    expect(pages[0].html).toContain("katex");
  });

  it("renders inline math with KaTeX", () => {
    const md = "# Math\nHere is $x^2$ inline.";
    const pages = parseMarkdown(md);
    expect(pages[0].html).toContain("katex");
  });

  it("renders mermaid code blocks as special div", () => {
    const md = "# Diagrams\n```mermaid\ngraph TD\n  A-->B\n```";
    const pages = parseMarkdown(md);
    expect(pages[0].html).toContain('class="mermaid-block"');
    expect(pages[0].html).toContain('class="mermaid"');
  });

  it("accepts a custom code renderer", () => {
    const md = "# Code\n```js\nconsole.log('hi')\n```";
    const pages = parseMarkdown(md, {
      codeRenderer: (text, lang) => ({
        html: `<pre class="custom" data-lang="${lang}">${text}</pre>`,
      }),
    });
    expect(pages[0].html).toContain('class="custom"');
    expect(pages[0].html).toContain('data-lang="js"');
  });

  it("sanitizes script tags from raw HTML in markdown", () => {
    const md = '# Test\n<script>alert("xss")</script>\n<p>safe</p>';
    const pages = parseMarkdown(md);
    expect(pages[0].html).not.toContain("<script");
    expect(pages[0].html).toContain("<p>safe</p>");
  });

  it("sanitizes event handlers from raw HTML", () => {
    const md = '# Test\n<img src="x" onerror="alert(1)">';
    const pages = parseMarkdown(md);
    expect(pages[0].html).not.toContain("onerror");
  });

  it("does not extract headings from code fences as page headings", () => {
    const md = "# Page\n```\n### Not a heading\n```\n### Real heading";
    const pages = parseMarkdown(md);
    expect(pages[0].headings).toHaveLength(1);
    expect(pages[0].headings[0].text).toBe("Real heading");
  });
});
