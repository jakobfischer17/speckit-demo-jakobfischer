# speckit-demo-jakobfischer Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-26

## Active Technologies
- JavaScript (ES2022) with React 19.x + React 19, @dnd-kit/core (drag-and-drop), @tanstack/react-virtual (list virtualization), idb (IndexedDB wrapper - existing) (002-daily-planner)
- IndexedDB via `idb` library — extend existing `productivity-hub` database with `tasks` and `archivedTasks` stores (002-daily-planner)
- JavaScript (ES modules) with React 19 on Node.js 20+   + React 19, Vite 7, `idb`, `@dnd-kit/*`, `@tanstack/react-virtual`, `date-fns`, Vitest 4, Testing Library, jsdom, fake-indexeddb   (002-daily-planner)
- IndexedDB (`productivity-hub`) via shared `db.js`; BroadcastChannel for multi-tab sync   (002-daily-planner)

- JavaScript ES2022+ (React 19.x) + React 19, Vite 7, Web Audio API (native), IndexedDB (native via idb wrapper) (001-focus-enhancement-suite)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript ES2022+ (React 19.x): Follow standard conventions

## Recent Changes
- 002-daily-planner: Added JavaScript (ES modules) with React 19 on Node.js 20+   + React 19, Vite 7, `idb`, `@dnd-kit/*`, `@tanstack/react-virtual`, `date-fns`, Vitest 4, Testing Library, jsdom, fake-indexeddb  
- 002-daily-planner: Added JavaScript (ES2022) with React 19.x + React 19, @dnd-kit/core (drag-and-drop), @tanstack/react-virtual (list virtualization), idb (IndexedDB wrapper - existing)

- 001-focus-enhancement-suite: Added JavaScript ES2022+ (React 19.x) + React 19, Vite 7, Web Audio API (native), IndexedDB (native via idb wrapper)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
