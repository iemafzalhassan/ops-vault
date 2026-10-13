---
status: testing
phase: 01-portal-and-scripts
source:
  - 01-PORTAL-AND-SCRIPTS-SUMMARY.md
started: 2026-10-13T06:12:00Z
updated: 2026-10-13T06:12:00Z
---

## Current Test

number: 1
name: Live Web Portal & Homepage Health Check
expected: |
  Visiting https://ops-vault-sand.vercel.app loads the dark-themed OpsVault web portal with hero banner, live search bar, role filter badges (All: 5, SRE: 1, DevOps: 1, Platform Ops: 1, Support: 1, DevRel: 1), 5 verified script cards, interactive script generator, and learning guides.
awaiting: user response

## Tests

### 1. Live Web Portal & Homepage Health Check
expected: Visiting https://ops-vault-sand.vercel.app loads the dark-themed OpsVault web portal with hero banner, live search bar, role filter badges (All: 5, SRE: 1, DevOps: 1, Platform Ops: 1, Support: 1, DevRel: 1), 5 verified script cards, interactive script generator, and learning guides.
result: [pending]

### 2. Keyboard Navigation & Search Zero-State Recovery
expected: Pressing '/' focuses the search bar. Typing a query (e.g. 'docker') filters the list in real-time. Typing an unmatched term (e.g. 'xyz123') renders the empty state placeholder with a 'Reset Filters' button that restores all cards when clicked.
result: [pending]

### 3. Script Inspection Drawer & Modal Ergonomics
expected: Clicking any script card (e.g. 'SSL/TLS Certificate Expiry Checker') opens a detail drawer showing Source Code, Incident War Story, Tools Demystified, and Docker Sandbox tabs. Pressing 'Escape' or clicking the 'X' button closes the modal, and background page scrolling remains locked while open.
result: [pending]

### 4. Interactive Script Builder & Exporter
expected: Adjusting the Target Endpoint, Alert Threshold slider, or Webhook URL in the 'Interactive Script Builder' section dynamically updates the bash code preview in real-time. Clicking 'Copy Script' or 'Download .sh' triggers toast feedback and exports the customized script.
result: [pending]

### 5. Safe Testing Sandboxes & Production Scripts Hardening
expected: All production scripts in scripts/ include strict safety flags (set -euo pipefail, --dry-run switches, signal traps). The one-line Docker command runs the test inside an isolated Alpine container without touching or modifying the host workstation.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

<!-- None yet -->
