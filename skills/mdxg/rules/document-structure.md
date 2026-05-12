# Document Structure

## 6. Virtual Pages

### 6.1 Page Boundaries

A conforming tool MUST split the document into virtual pages at H1 (`#`) and H2 (`##`) heading boundaries. Both ATX-style (`# Heading`) and setext-style (underlined with `===` or `---`) headings MUST be recognized.

Headings inside fenced code blocks (`` ``` `` or `~~~`) MUST NOT be treated as page boundaries. The tool MUST track code fence open/close state when scanning for headings.

Each heading that triggers a page boundary starts a new page. The heading text becomes the page title. Content following the heading, up to the next page boundary, belongs to that page.

### 6.2 Pre-heading Content

Content appearing before the first H1 or H2 heading SHOULD be treated as an implicit page titled "Introduction." If the content before the first heading is empty or contains only whitespace, no Introduction page SHOULD be created. If an Introduction page is created, it MUST appear in page navigation alongside other pages.

### 6.3 Page Depth

Each page has a depth:

- H1 headings produce depth-1 pages
- H2 headings produce depth-2 pages

Depth SHOULD be used to convey hierarchy when listing pages (e.g., indentation, grouping, or visual weight).

### 6.4 Page Identifiers

Each page MUST have a unique, URL-safe identifier derived from its title (a "slug"). If multiple pages share the same slug, the tool MUST disambiguate them (e.g., by appending a numeric suffix).

## 7. Page Navigation

A conforming tool MUST provide a way for the user to:

- **See all pages** in the document, in document order, with depth hierarchy visible
- **Navigate to any page** by selecting it
- **Identify the current page**: the active page MUST be visually or contextually distinguished
- **Move sequentially**: the user MUST be able to advance to the next page or return to the previous page (see Section 9 for detailed requirements)

### 7.1 Implementation Examples

These are non-normative examples of how page navigation could be implemented:

- A sidebar with a clickable list of pages
- A dropdown/select menu in a toolbar
- A command palette with page search
- Swipe gestures on mobile
- Keyboard shortcuts (e.g., arrow keys)
- A collapsible tree view

## 8. Page Outline

A conforming tool MUST provide a way for the user to see and navigate to headings within the current page.

### 8.1 Requirements

- Only headings H3 through H6 within the active page MUST be included (H1 and H2 are page boundaries, not in-page headings)
- Each heading MUST be navigable. Selecting it scrolls or jumps to that heading
- Heading depth SHOULD be visually conveyed (e.g., indentation, font size)
- The currently visible heading SHOULD be indicated (scroll-spy or equivalent)
- If the active page has no H3–H6 headings, the outline MAY be hidden or empty

### 8.2 Implementation Examples

- A right sidebar with an "On this page" list
- A floating outline panel
- A table of contents dropdown
- Breadcrumb-style heading indicators

## 9. Sequential Navigation

This section elaborates the sequential movement requirement from Section 7. A conforming tool MUST provide a way to move to the previous and next pages from the current page.

### 9.1 Requirements

- The previous and next page titles SHOULD be visible to the user
- Controls that are not applicable (e.g., "previous" on the first page) MUST be hidden or disabled
- Sequential navigation MUST be accessible from at least one location in the interface (e.g., toolbar, footer, or keyboard shortcut) and MAY be accessible from multiple locations

### 9.2 Implementation Examples

- Previous/next buttons in a toolbar
- Footer links with page titles and directional indicators
- Keyboard shortcuts
- Swipe gestures

## 10. Search

A conforming tool MUST provide a way to search text across all pages in the document.

### 10.1 Requirements

- The user MUST be able to invoke search (e.g., Cmd/Ctrl+F or a search icon)
- Search MUST operate on the rendered text content visible to the user, not on the raw markdown source (e.g., a search for "bold" should not match `**bold**` via the asterisks)
- The current match MUST be highlighted and scrolled into view
- The user MUST be able to step through matches (next/previous)
- When stepping through matches, the current match position MUST be preserved across page boundaries. Navigating to a match on another page MUST land on that specific match, not the first match on the page
- Match count SHOULD be displayed (e.g., "3 of 12")
- Search that crosses page boundaries SHOULD navigate to the page containing the match automatically

### 10.2 Implementation Examples

- A search bar that appears at the top of the content area
- Highlighted `<mark>` elements in the rendered content
- Keyboard shortcuts for next/previous match (Enter / Shift+Enter)
