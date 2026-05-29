import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { parseMarkdown, type Page } from "./parser";

export interface Doc {
  slug: string;
  label: string;
  title: string;
  pages: Page[];
  rawMarkdown: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, "../../../../");

const FILES: { slug: string; file: string; label: string }[] = [
  { slug: "readme", file: "README.md", label: "README.md" },
  { slug: "spec", file: "SPEC.md", label: "SPEC.md" },
];

let cachedDocs: Doc[] | null = null;

export async function getDocs(): Promise<Doc[]> {
  if (cachedDocs) return cachedDocs;

  cachedDocs = await Promise.all(
    FILES.map(async ({ slug, file, label }) => {
      const raw = await readFile(path.join(DOCS_DIR, file), "utf-8");
      const pages = await parseMarkdown(raw);
      for (const page of pages) {
        page.html = rewriteRelativePaths(page.html);
      }
      const title = pages[0]?.title ?? file;
      return { slug, label, title, pages, rawMarkdown: raw };
    })
  );

  return cachedDocs;
}

function rewriteRelativePaths(html: string): string {
  let out = html.replace(/src=(['"])assets\//g, "src=$1/");

  out = out.replace(/href=(['"])(?:\.\/)?README\.md(#[^'"]*)?\1/g, (_m, q: string, hash?: string) => {
    return `href=${q}/${hash ?? ""}${q}`;
  });

  out = out.replace(/href=(['"])(?:\.\/)?SPEC\.md(#[^'"]*)?\1/g, (_m, q: string, hash?: string) => {
    return `href=${q}/spec${hash ?? ""}${q}`;
  });

  out = out.replace(/href=(['"])(?![a-zA-Z][a-zA-Z0-9+.-]*:|#|\/)([^'"]+)\1/g, (_m, q: string, href: string) => {
    const normalized = href.replace(/^(\.\/)+/g, "").replace(/^(\.\.\/)+/g, "");
    if (normalized === "README.md" || normalized.startsWith("README.md#")) {
      return `href=${q}/${normalized.slice("README.md".length)}${q}`;
    }
    if (normalized === "SPEC.md" || normalized.startsWith("SPEC.md#")) {
      return `href=${q}/spec${normalized.slice("SPEC.md".length)}${q}`;
    }

    const basename = path.posix.basename(normalized);
    const looksLikeDirectory = normalized.endsWith("/") || !basename.includes(".");
    const type = looksLikeDirectory ? "tree" : "blob";
    return `href=${q}https://github.com/vercel-labs/mdxg/${type}/main/${normalized}${q}`;
  });

  return out;
}

export async function getDoc(slug: string): Promise<Doc | undefined> {
  const docs = await getDocs();
  return docs.find((d) => d.slug === slug);
}

export async function resolveRoute(segments: string[]): Promise<{ doc: Doc; pageIndex: number } | null> {
  const docs = await getDocs();

  if (segments.length === 0) {
    const doc = docs.find((d) => d.slug === "readme");
    if (!doc) return null;
    return { doc, pageIndex: 0 };
  }

  const [first, ...rest] = segments;
  const doc = docs.find((d) => d.slug === first);
  if (!doc) return null;

  if (rest.length === 0) {
    return { doc, pageIndex: 0 };
  }

  const pageSlug = rest[0];
  const pageIndex = doc.pages.findIndex((p) => p.id === pageSlug);
  if (pageIndex === -1) return null;

  return { doc, pageIndex };
}

export function getPageHref(doc: Doc, pageIndex: number): string {
  if (doc.slug === "readme" && pageIndex === 0) return "/";
  if (pageIndex === 0) return `/${doc.slug}`;
  return `/${doc.slug}/${doc.pages[pageIndex].id}`;
}

export async function getAllRouteParams(): Promise<{ slug: string[] }[]> {
  const docs = await getDocs();
  const params: { slug: string[] }[] = [{ slug: [] }];

  for (const doc of docs) {
    if (doc.slug !== "readme") {
      params.push({ slug: [doc.slug] });
    }
    for (let i = 1; i < doc.pages.length; i++) {
      params.push({ slug: [doc.slug, doc.pages[i].id] });
    }
  }

  return params;
}
