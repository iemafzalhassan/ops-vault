# Phase 1 — UI Design Contract: OpsVault Minimalist Engineering Workstation

**Status:** Approved  
**Aesthetic Direction:** Industrial Engineering Workstation / Senior SRE Workbench (Linear & Raycast DNA)  
**Target Audience:** DevOps, SRE, Platform Ops, Support Engineers, and aspiring infrastructure students.  
**Core Goal:** Eliminate generic "AI-template" aesthetics and replace with an authentic, human-crafted, high-density minimalist developer interface.

---

## 1. Visual & Aesthetic Architecture

### Palette & Materiality
- **Base Canvas:** Deep obsidian black (`#07090e`) with hairline subtle structural divisions (`border-white/[0.08]`).
- **Surface Elevation:**
  - Background: `#07090e`
  - Elevated Workstation Panels: `#0c0f17`
  - Active Element Inset: `#0a0d14`
  - Subtle Highlight Borders: `rgba(255, 255, 255, 0.08)`
- **Intent Accent Palette (Phosphor & Telemetry):**
  - **Phosphor Emerald (`#10b981` / `emerald-400`):** System healthy, verification passed, active cursor.
  - **Telemetry Cyan (`#06b6d4` / `cyan-400`):** Docker & container runtime, network telemetry.
  - **Amber Alert (`#f59e0b` / `amber-400`):** Outage warnings, incident war stories, disk pressure alerts.
  - **Monochrome Neutral (`#94a3b8` / `slate-400`, `#e2e8f0` / `slate-200`):** Readable, high-contrast technical prose.

### Typography
- **Monospace Priority:** `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas` for commands, paths, parameters, metrics, and script IDs.
- **Display & Interface:** `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif for clean, human, legible headings.
- **Hierarchy:**
  - Eyebrow / Micro-data: `text-[11px] font-mono tracking-wider uppercase`
  - Section Headings: `text-xs font-mono font-semibold uppercase tracking-widest text-slate-400`
  - Display Title: `text-3xl sm:text-4xl font-semibold tracking-tight text-white`
  - Code & Snippets: `text-[11px] font-mono leading-relaxed`

---

## 2. Key Screen Components & Human-Crafted Touchpoints

### A. The Telemetry Bar (Top Header)
- Handcrafted ASCII / SVG Vault mark with breathing telemetry dot (`● SYSTEMS NORMAL`).
- Direct indicators: `5 AUTOMATIONS VERIFIED`, `LINUX / MACOS / K8S`, `0 DEPENDENCIES`.
- Keyboard shortcut helper (`/ to search`, `ESC to clear`).
- Compact GitHub star count and Vercel status pill.

### B. The Asymmetric Hero: Problem vs Solution
- **Left Column:** Manifesto written from an engineer's perspective:
  - *"Real production scripts aren't written in a vacuum. They are forged during high-severity alerts when clusters burn."*
  - Quick-start curl command with 1-click execution.
- **Right Column (Interactive Incident Simulator):**
  - Interactive live toggle: `[Without OpsVault: Outage]` vs `[With OpsVault: Self-Healed]`.
  - Simulates the 2:15 AM wildcard TLS certificate failure or Docker disk exhaustion in a retro phosphor terminal box with real timestamps and resolution logs.

### C. The Script Explorer: Dual-Pane SRE Workbench
- **Filter Matrix:**
  - Tactile monospace pills: `[all_scripts]`, `[sre_reliability]`, `[k8s_platform]`, `[devops_ci]`, `[linux_support]`, `[devrel_tools]`.
- **Workbench Layout:**
  - Clean master list with script operational codes (`SRE-01`, `K8S-01`, etc.), real-world scenario prevented, runtime, and instant copy button.
  - Interactive split preview: clicking any row instantly reveals the full source code, the incident war story, the plain-English tool teardown, and the isolated throwaway Docker command.

### D. The Interactive Script Foundry (TUI Style)
- Re-architected as an in-browser TUI configurator.
- Live sliders for warning thresholds, endpoint inputs, dry-run safety toggle, and live bash output preview with download.

### E. Zero-to-Hero Engineering Field Manuals
- Styled as tactical runbook tracks:
  - Track 01: *Defensive Bash in Hostile Production Environments*
  - Track 02: *The Enterprise Guardrails: Traps, Signals & Dry-Runs*
  - Track 03: *Python for Infrastructure Engineers: Zero-Dependency CLIs*

---

## 3. Interaction & Keyboard Accessibility Contract
- `/` focuses the search bar instantly.
- `Escape` dismisses drawers, active selection, or search queries.
- All copy buttons trigger a low-profile terminal-styled floating toast.
- 100% responsive: degrades gracefully to single-column on mobile viewports.
