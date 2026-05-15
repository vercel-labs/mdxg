import { Marked } from "marked";
import katex from "katex";
import markedFootnote from "marked-footnote";

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface Page {
  title: string;
  id: string;
  /** 1 for H1 pages, 2 for H2 pages */
  depth: number;
  headings: Heading[];
  html: string;
  markdown: string;
}

export interface CodeRendererResult {
  html: string;
}

export interface ParseOptions {
  codeRenderer?: (text: string, lang: string | undefined) => CodeRendererResult;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripClosingHashes(text: string): string {
  return text.replace(/\s+#+\s*$/, "");
}

interface Chunk {
  title: string;
  depth: number;
  lines: string[];
}

export function splitIntoChunks(raw: string): Chunk[] {
  const lines = raw.split("\n");
  const chunks: Chunk[] = [];
  let current: Chunk | null = null;
  let inCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (/^`{3,}|^~{3,}/.test(line)) {
      inCodeFence = !inCodeFence;
      if (!current) {
        current = { title: "Introduction", depth: 1, lines: [] };
      }
      current.lines.push(line);
      continue;
    }
    
    if (inCodeFence) {
      if (!current) {
        current = { title: "Introduction", depth: 1, lines: [] };
      }
      current.lines.push(line);
      continue;
    }
    
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);

    const isSetextH1 =
      i + 1 < lines.length &&
      /^=+\s*$/.test(lines[i + 1]) &&
      line.trim().length > 0 &&
      !line.startsWith("#");

    const isSetextH2 =
      i + 1 < lines.length &&
      /^-{2,}\s*$/.test(lines[i + 1]) &&
      line.trim().length > 0 &&
      !line.startsWith("#");

    if (h2Match && !line.match(/^###/)) {
      if (current) chunks.push(current);
      current = { title: stripClosingHashes(h2Match[1].trim()), depth: 2, lines: [] };
    } else if (h1Match) {
      if (current) chunks.push(current);
      current = { title: stripClosingHashes(h1Match[1].trim()), depth: 1, lines: [] };
    } else if (isSetextH1) {
      if (current) chunks.push(current);
      current = { title: line.trim(), depth: 1, lines: [] };
      i++;
    } else if (isSetextH2) {
      if (current) chunks.push(current);
      current = { title: line.trim(), depth: 2, lines: [] };
      i++;
    } else {
      if (!current) {
        current = { title: "Introduction", depth: 1, lines: [] };
      }
      current.lines.push(line);
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function extractHeadings(lines: string[]): Heading[] {
  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();
  let inCodeFence = false;

  for (const line of lines) {
    if (/^`{3,}|^~{3,}/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const hMatch = line.match(/^(#{3,6})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = stripClosingHashes(hMatch[2].trim());
      const baseSlug = slugify(text);
      const count = slugCounts.get(baseSlug) ?? 0;
      slugCounts.set(baseSlug, count + 1);
      const id = count > 0 ? `${baseSlug}-${count}` : baseSlug;
      headings.push({ level, text, id });
    }
  }

  return headings;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s>][\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s>][\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s>][\s\S]*?>/gi, "")
    .replace(/<link[\s>][\s\S]*?>/gi, "")
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

function createMarkedInstance(options: ParseOptions): Marked {
  const marked = new Marked();

  marked.use(markedFootnote());

  marked.use({
    extensions: [
      {
        name: "math-block",
        level: "block" as const,
        start(src: string) {
          return src.indexOf("$$");
        },
        tokenizer(src: string) {
          const match = src.match(/^\$\$([\s\S]+?)\$\$/);
          if (match) {
            return { type: "math-block", raw: match[0], text: match[1].trim() };
          }
        },
        renderer(token) {
          const text = (token as unknown as { text: string }).text;
          try {
            return `<div class="math-display">${katex.renderToString(text, { displayMode: true, throwOnError: false })}</div>`;
          } catch {
            return `<pre><code>${escapeHtml(text)}</code></pre>`;
          }
        },
      },
      {
        name: "math-inline",
        level: "inline" as const,
        start(src: string) {
          return src.indexOf("$");
        },
        tokenizer(src: string) {
          const match = src.match(/^\$([^\$\n]+?)\$/);
          if (match) {
            return { type: "math-inline", raw: match[0], text: match[1].trim() };
          }
        },
        renderer(token) {
          const text = (token as unknown as { text: string }).text;
          try {
            return katex.renderToString(text, { displayMode: false, throwOnError: false });
          } catch {
            return `<code>${escapeHtml(text)}</code>`;
          }
        },
      },
    ],
  });

  marked.use({
    renderer: {
      code({ text, lang }: { text: string; lang?: string }) {
        if (lang === "mermaid") {
          return `<div class="mermaid-block"><pre class="mermaid">${escapeHtml(text)}</pre></div>`;
        }

        if (options.codeRenderer) {
          try {
            return options.codeRenderer(text, lang).html;
          } catch {
            return `<pre><code>${escapeHtml(text)}</code></pre>`;
          }
        }

        const langLabel = lang ? ` data-lang="${escapeHtml(lang)}"` : "";
        return `<pre${langLabel}><code>${escapeHtml(text)}</code></pre>`;
      },
    },
  });

  return marked;
}

export function parseMarkdown(raw: string, options: ParseOptions = {}): Page[] {
  const marked = createMarkedInstance(options);
  const chunks = splitIntoChunks(raw);

  if (chunks.length === 0) return [];

  const slugCounts = new Map<string, number>();

  return chunks.map((chunk) => {
    const baseSlug = slugify(chunk.title);
    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);
    const pageId = count > 0 ? `${baseSlug}-${count}` : baseSlug;

    const headings = extractHeadings(chunk.lines);

    const markdown = chunk.lines.join("\n");

    const headingIdMap = new Map<string, string[]>();
    for (const h of headings) {
      const key = `h${h.level}`;
      if (!headingIdMap.has(key)) headingIdMap.set(key, []);
      headingIdMap.get(key)!.push(h.id);
    }
    const headingIdCounters = new Map<string, number>();

    marked.use({
      renderer: {
        heading({ text, depth }: { text: string; depth: number }) {
          const key = `h${depth}`;
          const ids = headingIdMap.get(key);
          if (ids && ids.length > 0) {
            const counterKey = key;
            const idx = headingIdCounters.get(counterKey) ?? 0;
            headingIdCounters.set(counterKey, idx + 1);
            if (idx < ids.length) {
              return `<h${depth} id="${ids[idx]}">${text}</h${depth}>`;
            }
          }
          return `<h${depth}>${text}</h${depth}>`;
        },
      },
    });

    const rawHtml = marked.parse(markdown) as string;
    const html = sanitizeHtml(rawHtml);

    headingIdCounters.clear();

    return {
      title: chunk.title,
      id: pageId,
      depth: chunk.depth,
      headings,
      html,
      markdown,
    };
  });
}
