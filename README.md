# HighLevel Sales Pipeline (50,000 Deals)

A high-performance, real-time sales pipeline management workspace engineered to handle tens of thousands of active deals simultaneously with sub-millisecond interaction responsiveness, 60 FPS scrolling, and adverse network resilience.

---

## 🚀 Quick Start (One Command)

```bash
npm install && npm run dev
```

Then open `http://localhost:5173` in your browser.

To verify a production build:
```bash
npm run build && npm run preview
```

---

## 🎯 Architecture & Engineering Highlights

| Capability | Technical Solution |
| :--- | :--- |
| **50,000 In-Memory Deals at 60 FPS** | Normalized in-memory cache (~20 MB total) paired with `@tanstack/react-virtual`. Independent per-column windowing in Board View and row windowing in Table View ensures only ~15–30 DOM nodes exist at any moment. |
| **Dual-View UX (Kanban + Table)** | Dual interface optimized for two distinct workflows: visual qualification and day-to-day progression (Board View) alongside high-throughput batch operations and quarter-end purging (Table View). Both share the same instant 0ms in-memory store. |
| **Bulk Actions Engine** | Multi-select supporting `Shift + Click` range selection, `Select All in Stage`, and a floating batch action bar featuring single-click mass moves to Lost or Won. |
| **Unreliable Network Resilience** | Optimistic mutation state machine (`pending` → `synced` / `failed`) with automatic snapshot rollback, exponential backoff, and non-blocking actionable toasts with immediate **[Retry Save]** and **[Undo / Revert]**. |
| **Calm Teammate Concurrency** | Concurrency Buffer holds incoming simulated WebSocket events on active/focused deals. Instead of disruptive layout shifts or jumping cards, the UI displays subtle inline badges and a non-intrusive notification pill. |
| **Linear-Grade Keyboard Accessibility** | Full mouse-free workflow: `j`/`k` vertical navigation, `h`/`l` column switching, `x` selection, `m` fast stage picker (1-7), `/` search, and `?` cheat sheet. |
| **Chaos & Simulation Engine** | In-app Dev Drawer allowing testers to dynamically adjust latency (300–1500ms), failure rates (0–100%), offline mode, and trigger live teammate mutations. |

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `j` / `↓` | Navigate to next deal card or table row |
| `k` / `↑` | Navigate to previous deal card or table row |
| `h` / `←` | Switch to column on the left (Board View) |
| `l` / `→` | Switch to column on the right (Board View) |
| `x` or `Space` | Toggle selection of focused deal |
| `Shift + Click` | Range select deals in Table View |
| `Cmd/Ctrl + A` | Select all deals in active filter |
| `m` | Open Quick Stage Move popover (press `1`-`7` to move) |
| `1` - `7` | Move directly to: 1. New Lead, 2. Contacted, 3. Demo Done, 4. Proposal Sent, 5. Negotiation, 6. Won, 7. Lost |
| `b` | Switch to Kanban Board View |
| `t` | Switch to Bulk Table View |
| `/` | Focus global search input |
| `Esc` | Clear selection / dismiss modals and drawer |
| `?` | Toggle Keyboard Shortcuts cheat sheet |

---

## 📄 Detailed Architectural Write-Up

A comprehensive 1–2 page engineering document detailing key product decisions, rejected architectural alternatives, concurrency conflict resolution, and future roadmap is available in **[WRITEUP.md](WRITEUP.md)**.

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── BoardView.tsx              # Virtualized 7-column Kanban
│   │   ├── TableView.tsx              # High-density virtualized Table
│   │   ├── DealCard.tsx               # Card with optimistic & retry states
│   │   ├── StageMetricsBar.tsx        # Live aggregated counts & ₹ sums
│   │   ├── Header.tsx                 # Search, quick priority filters, theme & view toggle
│   │   ├── BulkActionBar.tsx          # Floating bar for mass stage changes
│   │   ├── DevDrawer.tsx              # Chaos & Latency simulation controls
│   │   ├── TeammateNotificationPill.tsx # Calm concurrency notification
│   │   ├── KeyboardShortcutsModal.tsx # Cheat sheet overlay
│   │   ├── QuickMoveModal.tsx         # Fast 1-7 stage selector
│   │   └── ToastContainer.tsx         # Non-intrusive actionable toasts
│   ├── hooks/
│   │   └── useGlobalKeyboardShortcuts.ts
│   ├── simulation/
│   │   ├── mockGenerator.ts           # Instant generation of 50k deals
│   │   └── mockApi.ts                 # Decoupled async backend with chaos engine
│   ├── store/
│   │   └── usePipelineStore.ts        # Zustand normalized store & state machine
│   ├── types/
│   │   └── pipeline.ts                # TypeScript interfaces
│   ├── utils/
│   │   └── formatters.ts              # Indian Rupee (₹) formatters
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── WRITEUP.md                         # 1-2 page official write-up
└── package.json
```
