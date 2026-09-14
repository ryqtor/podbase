# Lenny Growth Assistant — Design System & UI/UX Specification

## 1. Design Philosophy

The Lenny Growth Assistant interface is crafted with a **terminal-meets-modern-SaaS aesthetic**: dark mode by default, glassmorphism surface elevations, crisp emerald and blue accents, micro-animations, and information-dense typography.

---

## 2. Color Palette & Elevation Hierarchy

### 2.1 Surfaces & Backgrounds
- **Background**: `#0a0d14` — Deep obsidian canvas
- **Surface (Level 1)**: `#111726` — Sidebar & navigation panels
- **Surface Raised (Level 2)**: `#182035` — Message bubbles, cards, inputs
- **Surface Card (Level 3)**: `#1d263f` — Floating toolbars & badges
- **Border**: `#243152` — Crisp structural dividers
- **Border Subtle**: `#1a243d` — Secondary component borders

### 2.2 Accent & Semantic Tokens
- **Primary Emerald (`#22c55e` / `#4ade80`)**: Represents AI intelligence, active status, and primary calls to action.
- **Accent Blue (`#38bdf8`)**: Links, interactive tags, and citation highlights.
- **Accent Purple (`#a855f7`)**: Ollama / local model indicator.
- **Rose (`#f43f5e`)**: Deletions, warnings, and error alerts.

---

## 3. Typography Hierarchy

| Level | Size / Weight | Tracking | Usage |
|---|---|---|---|
| **App Title** | 14px / Bold (`font-bold`) | `-0.02em` | Sidebar header branding |
| **Section Header** | 11px / Semibold (`uppercase`) | `+0.05em` | Sidebar grouping labels, categories |
| **Body (User & Assistant)** | 14px / Regular & Medium | Normal | Chat conversation stream |
| **Citations & Quotes** | 11px / Normal (`italic`) | Normal | Source citation excerpts |
| **Code / Badges** | 11px / Monospace (`font-mono`) | Normal | Model selector, latencies, tokens |

---

## 4. Key UI Components

### 4.1 Split-Screen Workspace
- The right-hand panel slides in dynamically when an essay or artifact is generated.
- Toggle between **Live Rendered Preview** and **Raw Source Code**.
- Actions include single-click copy to clipboard and `.md` / `.html` direct file downloads.

### 4.2 Source Citation Cards
- Compact 2-column grid rendered directly below assistant answers.
- Badges show similarity percentage (`[89% match]`) and episode metadata.
- Expandable snippet preview allows reviewing the exact transcript context.

### 4.3 Chat Input with Model Switcher
- Floating input bar with auto-expanding textarea (up to 180px height).
- Native dropdown selector for OpenAI vs Ollama models with visual icon cues.
- Keyboard shortcuts: `Enter` to submit, `Shift + Enter` for multi-line prompts.

---

## 5. Accessibility & Responsive States

- **Keyboard Navigation**: Full tab ordering across sidebar sessions, model dropdown, prompts, and artifact actions.
- **Contrast Ratios**: All text tokens meet WCAG 2.1 AA standards on dark backgrounds (>4.5:1).
- **Responsive Layout**: On mobile/tablet screens, sidebar collides smoothly, and artifact viewer shifts to modal/overlay mode.
