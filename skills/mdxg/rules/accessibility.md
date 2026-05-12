# Accessibility

## 13. Keyboard Navigation

A conforming tool MUST support keyboard-based interaction for all core navigation features.

### 13.1 Requirements

- Page navigation controls (e.g., a page list) MUST be keyboard-navigable using arrow keys
- Selecting a page via keyboard (e.g., Enter) MUST navigate to that page
- The currently active page SHOULD receive focus when page navigation occurs
- Sequential navigation (previous/next) SHOULD be accessible via keyboard
- All interactive elements (buttons, links, controls) MUST have accessible names, using `aria-label`, visible text, or equivalent

### 13.2 Implementation Examples

- `tabindex="0"` on page list items with `keydown` handlers for arrow key navigation
- `aria-label` attributes on icon-only buttons
- Focus management that moves focus to the content area after page navigation
