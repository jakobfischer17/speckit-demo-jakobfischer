# Research: Focus Enhancement Suite

**Date**: 2026-01-26  
**Purpose**: Resolve technical unknowns and validate architecture decisions

## Research Tasks

### 1. Storage: IndexedDB vs localStorage

**Question**: Is IndexedDB the right choice for persisting focus session data?

**Context**: 
- Need to store: individual sessions (30-day rolling), lifetime aggregates, achievements
- Requirements: 30-day retention with cleanup, multi-tab sync, offline-first
- User specified: "use IndexedDB but validate if that is the right choice"

**Findings**:

| Criteria | localStorage | IndexedDB |
|----------|-------------|-----------|
| Storage Limit | ~5-10MB | 50MB+ (browser-dependent, can request more) |
| Data Structure | String key-value only | Objects, arrays, indexes |
| Querying | Manual iteration | Indexed queries, cursors |
| Transactions | None | ACID transactions |
| Multi-tab Sync | `storage` event fires | No native event; requires manual sync |
| API Complexity | Simple sync API | Complex async API |
| Browser Support | Universal | Universal (IE10+) |

**Analysis for our use case**:

1. **Data volume**: 30 days × ~20 sessions/day × ~100 bytes = ~60KB. Well within localStorage limits.
2. **Query patterns**: 
   - Get sessions by date range (7-day chart) → IndexedDB indexes excel here
   - Aggregate calculations → Both require iteration
3. **Multi-tab sync**: localStorage has native `storage` event; IndexedDB requires polling or BroadcastChannel
4. **Complexity**: IndexedDB requires async handling, error management, versioning

**Decision**: **IndexedDB with `idb` wrapper library**

**Rationale**:
- The `idb` library (~1.5KB gzipped) provides Promise-based API, eliminating callback complexity
- Date-range indexes will make 7-day chart queries efficient
- Future-proof for larger datasets or additional features
- Proper transaction support prevents data corruption
- Multi-tab sync will use BroadcastChannel API (native, no library needed)

**Alternatives Considered**:
- localStorage: Rejected due to lack of indexing for date queries and stringify/parse overhead
- Dexie.js: Rejected as heavier (~15KB); `idb` is minimal and sufficient

---

### 2. Web Audio API for Binaural Beats

**Question**: How to generate binaural beats using Web Audio API?

**Findings**:

Binaural beats require playing two slightly different frequencies in each ear:
- Alpha (10Hz beat): Left ear 200Hz, Right ear 210Hz
- Theta (6Hz beat): Left ear 200Hz, Right ear 206Hz  
- Gamma (40Hz beat): Left ear 200Hz, Right ear 240Hz

**Implementation approach**:
```
AudioContext
├── OscillatorNode (left, 200Hz) → GainNode → StereoPannerNode (-1)
└── OscillatorNode (right, 210Hz) → GainNode → StereoPannerNode (+1)
                                           └──────────┬──────────┘
                                                      ▼
                                               Destination
```

**Key considerations**:
1. AudioContext must be created after user interaction (browser autoplay policy)
2. Oscillators should use sine waves for pure tones
3. Smooth fade-in/out using GainNode.exponentialRampToValueAtTime()
4. Must properly disconnect and stop oscillators on cleanup

**Decision**: Custom hook `useBinauralBeat` managing AudioContext lifecycle

---

### 3. YouTube Embed for Ambient Tracks

**Question**: How to embed YouTube videos for focus music?

**Findings**:

Options evaluated:
1. **iframe embed**: Simple, but no programmatic volume control
2. **YouTube IFrame API**: Full control (play, pause, volume), requires script load
3. **Direct audio files**: Best UX, but licensing concerns

**Decision**: **YouTube IFrame API** for ambient tracks

**Rationale**:
- Provides volume control to match binaural beat volume
- Can detect when video becomes unavailable (onerror)
- No licensing issues with curated focus music playlists
- API is well-documented and stable

**Fallback strategy**: If embed fails, show message with direct YouTube link

**Curated content** (royalty-free focus music channels):
- Lofi Girl: Ambient beats
- Chillhop Music: Lo-fi hip hop
- The Soul of Wind: Nature ambience

---

### 4. Confetti Animation

**Question**: How to implement performant confetti without libraries?

**Findings**:

Options evaluated:
1. **CSS-only animation**: Limited particle count, hard to randomize
2. **Canvas API**: Full control, hardware-accelerated
3. **DOM elements + CSS transforms**: Good for few elements, janky at scale
4. **Web Animations API**: Modern, but limited for particle systems

**Decision**: **Canvas API with requestAnimationFrame**

**Rationale**:
- Single canvas element, no DOM thrashing
- Hardware accelerated via GPU
- Full control over particle physics
- Easy cleanup (just stop animation loop)
- Constitution requires 60fps; canvas achieves this reliably

**Implementation notes**:
- Particle count: 150-200 for "celebration" feel
- Physics: gravity, slight wind drift, rotation
- Duration: 3-5 seconds with fade-out
- Colors: Match app's CSS variable color palette

---

### 5. Section Navigation with Scroll Spy

**Question**: How to implement sticky nav with active section highlighting?

**Findings**:

Options evaluated:
1. **Intersection Observer API**: Native, performant, well-supported
2. **Scroll event listener**: Simple but performance-heavy without throttling
3. **CSS scroll-snap + :target**: Limited control over highlighting

**Decision**: **Intersection Observer API**

**Rationale**:
- Native browser API, no libraries
- Doesn't fire on every scroll pixel
- Can configure threshold for "active" determination
- Constitution prefers vanilla solutions

**Implementation**:
- Observe each section element
- When section enters 50% viewport, set as active
- Update nav highlighting via state
- Smooth scroll via CSS `scroll-behavior: smooth` + anchor links

---

### 6. Testing Setup

**Question**: What testing framework aligns with constitution requirements?

**Findings**:

Constitution requires:
- Component tests for interactive components
- Timer mocking capability
- Accessibility testing via roles/labels

**Decision**: **Playwright for E2E testing**

**Rationale**:
- Real browser testing catches integration issues that unit tests miss
- Built-in auto-waiting eliminates flaky tests
- Native support for accessibility testing via `getByRole`, `getByLabel`
- Cross-browser testing (Chromium, Firefox, WebKit) out of the box
- Excellent support for testing Web Audio API and Canvas animations
- Time manipulation via `page.clock` for timer testing
- Visual regression testing capability for confetti animations
- Parallel test execution for faster CI runs

**Package additions**:
```json
{
  "devDependencies": {
    "@playwright/test": "^1.50.0"
  }
}
```

**Test Structure**:
```
e2e/
├── audio-player.spec.ts      # US1: Binaural beats, ambient playback
├── milestone-rewards.spec.ts # US2: Confetti, achievement toasts
├── statistics.spec.ts        # US3: Stats display, streak calculations
├── productivity-tips.spec.ts # US4: Categories, citations
├── navigation.spec.ts        # Section nav, scroll spy
└── fixtures/
    └── test-utils.ts         # Shared helpers, page objects
```

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Storage | IndexedDB with `idb` wrapper | Date-range indexing, future-proof, transactions |
| Multi-tab Sync | BroadcastChannel API | Native, no library, lightweight |
| Binaural Audio | Web Audio API + custom hook | Native, precise frequency control |
| Ambient Tracks | YouTube IFrame API | Volume control, no licensing issues |
| Confetti | Canvas API | 60fps guaranteed, single element |
| Scroll Spy | Intersection Observer | Native, performant |
| Testing | Playwright E2E | Real browser, cross-browser, accessibility built-in |

## Outstanding Items

None - all technical unknowns resolved.
