# kanban-demo

A frontend-only Linear/Trello-style kanban board, built as a demo app for visual
regression testing (record a session → replay it → diff the screenshots).

No backend, no API routes, no network calls. Board data is seeded from a fixture
module and lives in React state, persisted to `localStorage`.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build + typecheck
pnpm typecheck
```

## Why it's shaped this way

The point of the app is to pack a lot of *client-side state transitions* onto a
*static data set*, so that a handful of recorded sessions cover a wide surface,
and a one-line CSS or logic change produces an obvious, legitimate diff.

Deliberate choices that matter for replay:

- **Drag and drop uses pointer events, not the HTML5 `draggable` API.** Native
  drag gestures are browser-owned and don't synthesize reliably on replay;
  `pointerdown`/`pointermove`/`pointerup` do. See `startDrag` in
  `src/components/Board.tsx`.
- **Nothing non-deterministic in render.** No `Date.now()`, no `Math.random()`,
  no relative timestamps ("3 days ago"). Card dates are fixed strings in the
  fixture and new cards get a fixed date; toast ids come from a counter. Two
  replays of the same session produce byte-identical DOM.
- **Everything interactive is a client component**, so replay drives real DOM
  state instead of server round-trips.
- **Theme is applied by an inline script before first paint**
  (`THEME_INIT_SCRIPT` in `src/lib/store.tsx`), so dark-mode screenshots never
  catch a flash of light mode.
- **`localStorage` is seeded from the fixture when empty**, so a fresh browser
  profile always starts from the same board.

## Interaction surface

Each of these is a natural screenshot moment:

| Interaction | How |
| --- | --- |
| Move a card | Drag it, or focus it and press `Alt` + arrow keys |
| Reorder within a column | Drag, or `Alt` + `↑`/`↓` |
| Inline rename | Double-click a card title; `Enter` commits, `Escape` reverts |
| Card detail modal | Click **Details**, or focus a card and press `Enter` |
| Edit priority / points / assignee / labels / column | In the modal |
| Create a card | **+ Add card** at the foot of a column |
| Delete a card | **Delete card** in the modal |
| Search | Toolbar search box (matches title, description, card id) |
| Filter | Assignee dropdown, label chips |
| Sort | Manual / priority / points / title — non-manual sorts disable drag |
| Command palette | `⌘K` / `Ctrl+K` — jump to a card or run an action |
| Dark mode | Toolbar toggle, or the palette |
| Toasts | Fire on move, rename, create, delete, reset |
| Reset | Toolbar **Reset** restores the seed fixture |

## Layout

```
src/
  app/
    layout.tsx        theme-init script, globals
    page.tsx          composes the providers + the five top-level pieces
    globals.css       Tailwind v4 entry, class-based dark variant
  components/
    Board.tsx         column layout, pointer-drag state machine, keyboard moves
    Column.tsx        per-column list, drop placeholder, empty states, composer
    Card.tsx          card chrome, inline title editing
    CardModal.tsx     detail dialog
    CommandPalette.tsx
    Toasts.tsx
    Toolbar.tsx       search, filters, sort, theme, reset
  lib/
    types.ts          the domain model
    fixtures.ts       seed board: 5 columns, 14 cards, 5 members, 6 labels
    store.tsx         board reducer + UI context, localStorage persistence
    utils.ts          filtering, sorting, formatting, colour maps
```
