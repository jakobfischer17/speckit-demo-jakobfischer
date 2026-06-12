# Accessibility Audit — WCAG 2.2 AA

This document tracks the accessibility audit for the Productivity Hub and the
remediation status of findings. Severity is rated High / Medium / Low.

## Method

- Manual keyboard-only walkthrough of every section
- Screen reader landmark navigation
- Color-contrast review of text and interactive elements

## Findings & status

| ID | Area | Finding | Severity | Status |
|----|------|---------|----------|--------|
| A1 | Global | No "skip to content" link for keyboard users | High | ✅ Fixed — skip link added in `App.jsx` |
| A2 | Global | Focus indicator not consistently visible | High | ✅ Fixed — `:focus-visible` outlines in `App.css` |
| A3 | Layout | Sections lacked accessible names | Medium | ✅ Fixed — `aria-label` per `<section>` |
| A4 | Navigation | Active nav item not announced | Medium | ✅ Already present — `aria-current` in `SectionNav` |
| A5 | Theme | No high-contrast / dark option | Medium | ✅ Fixed — dark theme toggle persisted |
| A6 | Timer | Break action buttons missing labels | Medium | ✅ Fixed — `aria-label` on skip/snooze |
| A7 | Charts | Weekly chart relies on color alone | Low | ⏳ Follow-up — add text/value labels |
| A8 | Forms | Some inputs rely on placeholder as label | Low | ⏳ Follow-up — associate `<label>` elements |

## Follow-ups

Low-severity items (A7, A8) are tracked for a future iteration and do not block
AA conformance for the core flows.
