"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Terminal, Shield, Cpu, HardDrive, Wrench, Sparkles, 
  Search, Copy, Check, ExternalLink, Play, BookOpen, 
  GitFork, Star, AlertCircle, ArrowUpRight, Code, Download,
  Sliders, ChevronRight, X, Heart, Eye, RefreshCw, Flame, CheckCircle2
} from "lucide-react";
import { SCRIPTS_DATA, ScriptItem } from "../data/scripts";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [activeScript, setActiveScript] = useState<ScriptItem | null>(SCRIPTS_DATA[0]);
  const [modalTab, setModalTab] = useState<"code" | "incident" | "tools" | "sandbox">("code");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [simState, setSimState] = useState<"outage" | "healed">("outage");

  // Script Generator State
  const [genDomain, setGenDomain] = useState("api.production.internal");
  const [genWarningDays, setGenWarningDays] = useState(14);
  const [genDryRun, setGenDryRun] = useState(true);
  const [genWebhook, setGenWebhook] = useState("https://hooks.slack.com/services/T00/B00/X00");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: press '/' to focus search, 'Escape' to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (searchQuery) setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Copy helper
  const handleCopy = (text: string, label: string = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    triggerToast(label);
  };

  // Download custom script helper
  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/x-sh" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded ${filename}`);
  };

  // Filtered scripts
  const filteredScripts = useMemo(() => {
    return SCRIPTS_DATA.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(q) ||
        item.opCode.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.preventedImpact.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        item.role.toLowerCase().includes(q);

      const matchesRole = selectedRole === "All" || item.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [searchQuery, selectedRole]);

  // Role Counts
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { All: SCRIPTS_DATA.length };
    SCRIPTS_DATA.forEach(s => {
      counts[s.role] = (counts[s.role] || 0) + 1;
    });
    return counts;
  }, []);

  // Generated code output
  const generatedCode = useMemo(() => {
    return `#!/usr/bin/env bash
# ==============================================================================
# Script: custom_cert_checker.sh
# Generated via OpsVault (https://ops-vault-sand.vercel.app)
# Description: Automated SSL/TLS expiration check for \${TARGET_DOMAIN}
# Standard: Strict error containment + Safe dry-run support
# ==============================================================================

set -euo pipefail
IFS=$'\\n\\t'

TARGET_DOMAIN="${genDomain}"
WARNING_DAYS=${genWarningDays}
WEBHOOK_URL="${genWebhook}"
DRY_RUN=${genDryRun}

echo "[INFO] Querying TLS certificate for: \${TARGET_DOMAIN}:443..."
cert_raw=$(echo | openssl s_client -servername "\${TARGET_DOMAIN}" -connect "\${TARGET_DOMAIN}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null || true)

if [[ -z "\${cert_raw}" ]]; then
    echo "[ERROR] Failed to fetch certificate for \${TARGET_DOMAIN}" >&2
    exit 1
fi

expiry_str="\${cert_raw#notAfter=}"
expiry_epoch=$(date -d "\${expiry_str}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "\${expiry_str}" +%s 2>/dev/null)
days_remaining=$(( (expiry_epoch - $(date +%s)) / 86400 ))

echo "[INFO] Days remaining: \${days_remaining} (Expires: \${expiry_str})"

if [[ \${days_remaining} -le \${WARNING_DAYS} ]]; then
    payload="{\\"text\\": \\"🚨 SSL Warning: \${TARGET_DOMAIN} expires in \${days_remaining} days!\\"}"
    if [[ "\${DRY_RUN}" == "true" ]]; then
        echo "[DRY-RUN] Would dispatch webhook: \${payload}"
    else
        echo "[ALERT] Dispatching webhook..."
        curl -s -X POST -H 'Content-Type: application/json' -d "\${payload}" "\${WEBHOOK_URL}"
    fi
fi
`;
  }, [genDomain, genWarningDays, genDryRun, genWebhook]);

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-200 selection:bg-emerald-500/25 selection:text-emerald-200 flex flex-col font-sans relative">
      {/* Subtle Architectural Grid Texture */}
      <div className="fixed inset-0 pointer-events-none bg-grid-hairline mask-radial-fade opacity-70 z-0" />

      {/* Floating Low-Profile Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-3.5 py-2 rounded-lg bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 font-mono text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Engineering Telemetry Header */}
      <header className="border-b border-white/[0.08] bg-[#06080d]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          {/* Logo & Version Status */}
          <div className="flex items-center space-x-3">
            <a href="#" className="flex items-center space-x-2 group">
              <div className="w-7 h-7 rounded border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold transition group-hover:border-emerald-400">
                &gt;_
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-mono font-bold text-sm tracking-tight text-white group-hover:text-emerald-300 transition">
                  OPS//VAULT
                </span>
                <span className="text-[10px] font-mono text-slate-500">v1.4</span>
              </div>
            </a>

            <div className="hidden lg:flex items-center space-x-2 border-l border-white/[0.08] pl-3 text-[11px] font-mono text-slate-500">
              <span className="inline-flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400/90 font-medium">SYSTEMS NORMAL</span>
              </span>
              <span>·</span>
              <span>POSIX / K8S VERIFIED</span>
            </div>
          </div>

          {/* Quick Nav & External Links */}
          <div className="flex items-center space-x-3">
            <nav className="hidden md:flex items-center space-x-5 text-xs font-mono text-slate-400">
              <a href="#workbench" className="hover:text-white transition">/workbench</a>
              <a href="#simulator" className="hover:text-white transition">/incident-sim</a>
              <a href="#foundry" className="hover:text-white transition">/foundry</a>
              <a href="#manuals" className="hover:text-white transition">/runbooks</a>
            </nav>

            <div className="flex items-center space-x-2">
              <a
                href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiemafzalhassan%2Fops-vault"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-slate-300 border border-white/[0.08] transition"
              >
                <span>Deploy to Vercel</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="https://github.com/iemafzalhassan/ops-vault"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white text-slate-950 hover:bg-slate-200 text-xs font-mono font-semibold transition"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Star on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full relative z-10 flex-1 flex flex-col space-y-16">
        
        {/* Asymmetric Engineering Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          {/* Left Column: Mission Manifesto */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>COMMUNITY-CURATED INFRASTRUCTURE AUTOMATION</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
              Production scripts forged during 3 AM severity-1 outages.
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Generic StackOverflow answers lack safety guardrails. OpsVault collects defensive, zero-assumption automations used on live enterprise servers, Kubernetes clusters, and cloud fleets—annotated line-by-line with safe throwaway Docker sandboxes.
            </p>

            {/* Quick-Start Terminal Command */}
            <div className="p-3 rounded-lg bg-[#0d1117] border border-white/[0.08] flex items-center justify-between font-mono text-xs max-w-xl group">
              <div className="flex items-center space-x-2.5 overflow-x-auto text-slate-300">
                <span className="text-emerald-400 font-bold select-none">$</span>
                <span className="select-all text-[11px]">curl -fsSL https://raw.githubusercontent.com/iemafzalhassan/ops-vault/main/scripts/devrel/developer-env-doctor/doctor.sh | bash</span>
              </div>
              <button
                onClick={() => handleCopy("curl -fsSL https://raw.githubusercontent.com/iemafzalhassan/ops-vault/main/scripts/devrel/developer-env-doctor/doctor.sh | bash", "Quickstart command copied!")}
                className="p-1.5 rounded hover:bg-white/[0.08] text-slate-400 hover:text-white transition flex-shrink-0 ml-2"
                title="Copy Quickstart Command"
                aria-label="Copy Quickstart Command"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-2 max-w-lg border-t border-white/[0.06] text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Safety Guarantee</span>
                <span className="text-white font-semibold">set -euo pipefail</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Testing Mode</span>
                <span className="text-emerald-400 font-semibold">--dry-run standard</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Target Runtimes</span>
                <span className="text-white font-semibold">Linux / K8s / macOS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Incident Simulator */}
          <div id="simulator" className="lg:col-span-5">
            <div className="rounded-xl bg-[#0b0e14] border border-white/[0.08] shadow-2xl overflow-hidden font-mono text-xs flex flex-col">
              {/* Terminal Title Bar */}
              <div className="px-4 py-2.5 bg-[#0e121a] border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-slate-400 ml-2">incident_postmortem.log</span>
                </div>
                
                {/* State Toggle */}
                <div className="flex items-center bg-black/40 rounded p-0.5 border border-white/[0.06] text-[10px]">
                  <button
                    onClick={() => setSimState("outage")}
                    className={`px-2 py-0.5 rounded transition ${
                      simState === "outage"
                        ? "bg-rose-500/20 text-rose-300 font-semibold"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    Unmitigated Outage
                  </button>
                  <button
                    onClick={() => setSimState("healed")}
                    className={`px-2 py-0.5 rounded transition ${
                      simState === "healed"
                        ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    With OpsVault
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-4 bg-[#080b10] min-h-[220px] text-[11px] leading-relaxed flex flex-col justify-between">
                {simState === "outage" ? (
                  <div className="space-y-1.5 text-rose-300/90">
                    <p className="text-slate-500">[03:14:02 UTC] Node alert: worker-node-04</p>
                    <p className="text-rose-400 font-semibold">🚨 FATAL: DiskPressure condition met (98.4% used)</p>
                    <p className="text-slate-400">&gt; kubelet: Evicting pods in PriorityClass &#39;standard&#39;</p>
                    <p className="text-rose-300">&gt; postgres-replica-0: Terminating (Disk full)</p>
                    <p className="text-rose-300">&gt; checkout-service-78f: 503 Service Unavailable</p>
                    <p className="text-amber-400">&gt; PagerDuty: 14 engineers paged. MTTR: 1 hr 45 min</p>
                    <div className="pt-2 text-[10px] text-slate-500 border-t border-rose-900/30">
                      Root Cause: 45GB unrotated Docker build layers filled /var/lib/docker.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-emerald-300/90">
                    <p className="text-slate-500">[03:00:00 UTC] CronJob initiated: DEV-01 safe_prune.sh</p>
                    <p className="text-cyan-300">&gt; df -P /var/lib/docker: 78% utilized (Threshold: 75%)</p>
                    <p className="text-emerald-400 font-semibold">⚡ TRIGGER: Safety threshold breached. Commencing targeted prune...</p>
                    <p className="text-slate-300">&gt; docker builder prune (older than 24h): 32.4 GB reclaimed</p>
                    <p className="text-slate-300">&gt; docker image prune (dangling): 12.1 GB reclaimed</p>
                    <p className="text-emerald-400 font-semibold">✅ SUCCESS: Disk usage normalized to 48%. Node healthy.</p>
                    <div className="pt-2 text-[10px] text-slate-500 border-t border-emerald-900/30">
                      Zero customer impact. Zero pager alerts dispatched.
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500">
                  <span>Interactive Telemetry Simulation</span>
                  <span className="text-emerald-400 font-mono">100% IDEMPOTENT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Script Workbench Section */}
        <section id="workbench" className="space-y-6 pt-4">
          <div className="border-b border-white/[0.08] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                // SRE &amp; DEVOPS WORKBENCH
              </div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Verified Enterprise Automations
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scripts, tags, commands..."
                className="w-full pl-9 pr-8 py-2 rounded bg-[#0d1117] border border-white/[0.08] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500 transition"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 border border-white/[0.08] px-1 rounded">
                /
              </div>
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {["All", "SRE", "Platform Ops", "DevOps", "Support", "DevRel"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded transition flex items-center space-x-1.5 border ${
                  selectedRole === role
                    ? "bg-white text-slate-950 font-semibold border-white"
                    : "bg-[#0d1117] text-slate-400 hover:text-white border-white/[0.06] hover:border-white/[0.15]"
                }`}
              >
                <span>{role === "All" ? "all_systems" : role.toLowerCase().replace(" ", "_")}</span>
                <span className={`text-[10px] ${selectedRole === role ? "text-slate-600" : "text-slate-500"}`}>
                  [{roleCounts[role] || 0}]
                </span>
              </button>
            ))}
          </div>

          {/* Workbench Grid Layout: Split Master & Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Script Index List */}
            <div className="lg:col-span-5 space-y-2.5">
              {filteredScripts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#0d1117]/50 font-mono text-xs">
                  <p className="text-slate-400 mb-2">No scripts matched &quot;{searchQuery}&quot;</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedRole("All");
                    }}
                    className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 rounded text-xs transition"
                  >
                    Reset Filter Matrix
                  </button>
                </div>
              ) : (
                filteredScripts.map((script) => {
                  const isSelected = activeScript?.id === script.id;
                  return (
                    <div
                      key={script.id}
                      onClick={() => {
                        setActiveScript(script);
                        setModalTab("code");
                      }}
                      className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between group ${
                        isSelected
                          ? "bg-[#0f141f] border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                          : "bg-[#0b0e14] hover:bg-[#0e121a] border-white/[0.06] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-white/[0.04] text-slate-400 border border-white/[0.06]"
                          }`}>
                            {script.opCode}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {script.role}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {script.linesCount} lines · {script.language}
                        </span>
                      </div>

                      <h3 className={`text-sm font-semibold mb-1 transition ${
                        isSelected ? "text-emerald-300" : "text-white group-hover:text-slate-200"
                      }`}>
                        {script.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {script.summary}
                      </p>

                      <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span className="truncate max-w-[240px] text-slate-400">
                          Prevents: {script.preventedImpact}
                        </span>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(script.code, `Copied ${script.title}`);
                            }}
                            className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-white transition"
                            title="Quick Copy Script"
                            aria-label={`Copy code for ${script.title}`}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <ChevronRight className={`w-3.5 h-3.5 transition ${
                            isSelected ? "text-emerald-400 translate-x-0.5" : "text-slate-600"
                          }`} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Live Interactive Inspector Pane */}
            <div className="lg:col-span-7 sticky top-20">
              {activeScript ? (
                <div className="rounded-xl bg-[#0b0e14] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col">
                  {/* Pane Header */}
                  <div className="p-4 bg-[#0e121a] border-b border-white/[0.06] flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                          {activeScript.opCode} · {activeScript.role}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{activeScript.path}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{activeScript.title}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(activeScript.code, activeScript.path.split("/").pop() || "script.sh")}
                        className="px-2.5 py-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono flex items-center space-x-1.5 border border-white/[0.08] transition"
                        title="Download raw file"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => handleCopy(activeScript.code, "Code copied to clipboard!")}
                        className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-semibold flex items-center space-x-1.5 transition"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Inspector Tabs */}
                  <div className="flex border-b border-white/[0.06] px-4 bg-[#090c12] text-xs font-mono">
                    <button
                      onClick={() => setModalTab("code")}
                      className={`py-2.5 px-3 border-b-2 transition ${
                        modalTab === "code"
                          ? "border-emerald-400 text-white font-semibold"
                          : "border-transparent text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      source.sh
                    </button>
                    <button
                      onClick={() => setModalTab("incident")}
                      className={`py-2.5 px-3 border-b-2 transition ${
                        modalTab === "incident"
                          ? "border-emerald-400 text-white font-semibold"
                          : "border-transparent text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      war_story.md
                    </button>
                    <button
                      onClick={() => setModalTab("tools")}
                      className={`py-2.5 px-3 border-b-2 transition ${
                        modalTab === "tools"
                          ? "border-emerald-400 text-white font-semibold"
                          : "border-transparent text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      tools_teardown.json
                    </button>
                    <button
                      onClick={() => setModalTab("sandbox")}
                      className={`py-2.5 px-3 border-b-2 transition ${
                        modalTab === "sandbox"
                          ? "border-emerald-400 text-white font-semibold"
                          : "border-transparent text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      docker_sandbox
                    </button>
                  </div>

                  {/* Inspector Content */}
                  <div className="p-4 bg-[#080b10] min-h-[360px] max-h-[500px] overflow-y-auto text-xs font-mono">
                    {modalTab === "code" && (
                      <pre className="text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre font-mono">
                        {activeScript.code}
                      </pre>
                    )}

                    {modalTab === "incident" && (
                      <div className="space-y-4 font-sans text-xs">
                        <div className="p-4 rounded-lg bg-amber-500/[0.07] border border-amber-500/20 text-slate-300">
                          <div className="font-mono font-semibold text-amber-400 mb-2 flex items-center space-x-1.5 text-xs">
                            <AlertCircle className="w-4 h-4" />
                            <span>OPERATIONAL INCIDENT ROOT CAUSE</span>
                          </div>
                          <p className="leading-relaxed text-slate-300">
                            {activeScript.incidentStory}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-[#0e121a] border border-white/[0.06] text-slate-400">
                          <span className="text-white font-mono text-xs block mb-1">Prevented SLA Impact:</span>
                          <p>{activeScript.preventedImpact}</p>
                        </div>
                      </div>
                    )}

                    {modalTab === "tools" && (
                      <div className="space-y-3 font-sans text-xs">
                        <p className="text-slate-400 mb-3 font-mono text-[11px]">
                          Plain-English breakdown of cryptic systems commands used in this script:
                        </p>
                        {activeScript.toolsExplained.map((t, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-[#0e121a] border border-white/[0.06]">
                            <span className="font-mono font-semibold text-emerald-400 block mb-1 text-xs">
                              {t.tool}
                            </span>
                            <p className="text-slate-300 text-xs leading-relaxed">{t.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {modalTab === "sandbox" && (
                      <div className="space-y-4 font-mono text-xs">
                        <p className="text-slate-400 text-xs">
                          Run in an isolated throwaway Docker container with zero modification to your workstation host:
                        </p>
                        <pre className="p-3.5 rounded-lg bg-black border border-white/[0.08] text-emerald-300 text-[11px] whitespace-pre-wrap leading-relaxed">
                          {activeScript.dockerSandbox}
                        </pre>
                        <button
                          onClick={() => handleCopy(activeScript.dockerSandbox, "Docker command copied!")}
                          className="px-3 py-1.5 rounded bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono flex items-center space-x-1.5 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Docker Command</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inspector Footer */}
                  <div className="px-4 py-2.5 bg-[#0e121a] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Runtime: {activeScript.runtimeVersion}</span>
                    <span className="text-emerald-400">STRICT PIPELINE READY</span>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center border border-white/[0.06] rounded-xl bg-[#0b0e14] font-mono text-xs text-slate-500">
                  Select a script from the index to inspect code &amp; incident teardown
                </div>
              )}
            </div>
          </div>
        </section>

        {/* The Script Foundry (Interactive TUI Builder) */}
        <section id="foundry" className="pt-8 border-t border-white/[0.08]">
          <div className="mb-6">
            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
              // SCRIPT FOUNDRY
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Interactive Automation Generator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tailor enterprise parameters in real-time to generate custom, production-hardened TLS monitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0b0e14] border border-white/[0.08] rounded-xl p-6 font-mono text-xs">
            {/* Form Controls */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5">TARGET DOMAIN (FQDN)</label>
                <input
                  type="text"
                  value={genDomain}
                  onChange={(e) => setGenDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-[#06080d] border border-white/[0.08] rounded text-slate-200 focus:outline-none focus:border-slate-500 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-slate-400">EXPIRATION ALERT THRESHOLD</label>
                  <span className="text-emerald-400 font-bold">{genWarningDays} days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="60"
                  value={genWarningDays}
                  onChange={(e) => setGenWarningDays(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5">WEBHOOK ENDPOINT URL</label>
                <input
                  type="text"
                  value={genWebhook}
                  onChange={(e) => setGenWebhook(e.target.value)}
                  className="w-full px-3 py-2 bg-[#06080d] border border-white/[0.08] rounded text-slate-200 focus:outline-none focus:border-slate-500 text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="genDryRun"
                  checked={genDryRun}
                  onChange={(e) => setGenDryRun(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <label htmlFor="genDryRun" className="text-slate-300 text-xs cursor-pointer">
                  Enable Dry-Run Safe Mode (--dry-run)
                </label>
              </div>
            </div>

            {/* Generated Code Preview */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <pre className="p-4 rounded-lg bg-[#06080d] border border-white/[0.08] text-[11px] text-emerald-300/90 overflow-x-auto max-h-56 leading-relaxed mb-4">
                {generatedCode}
              </pre>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(generatedCode, "custom_cert_checker.sh")}
                  className="flex-1 py-2 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-mono flex items-center justify-center space-x-1.5 border border-white/[0.08] transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sh</span>
                </button>
                <button
                  onClick={() => handleCopy(generatedCode, "Custom script copied!")}
                  className="flex-1 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Script</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Field Manuals (Learning Tracks) */}
        <section id="manuals" className="pt-8 border-t border-white/[0.08]">
          <div className="mb-6">
            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
              // ENGINEERING RUNBOOKS
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Zero-to-Hero Production Runbooks
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Written for students and developers transitioning to infrastructure roles. Understand what the shell does under the hood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://github.com/iemafzalhassan/ops-vault/blob/main/docs/beginner-guides/01-bash-scripting-fundamentals.md"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-xl bg-[#0b0e14] hover:bg-[#0f141f] border border-white/[0.06] hover:border-white/[0.15] transition flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono text-emerald-400 mb-2 block font-semibold">
                  RUNBOOK // 01
                </span>
                <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-emerald-300 transition">
                  Defensive Shell Foundations
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Shebangs, exit codes, pipeline standard streams (stdin/stdout/stderr), and POSIX portabilities.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                <span>Read Runbook</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a
              href="https://github.com/iemafzalhassan/ops-vault/blob/main/docs/beginner-guides/02-production-hardening-rules.md"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-xl bg-[#0b0e14] hover:bg-[#0f141f] border border-white/[0.06] hover:border-white/[0.15] transition flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono text-cyan-400 mb-2 block font-semibold">
                  RUNBOOK // 02
                </span>
                <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-cyan-300 transition">
                  Production Hardening Standards
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  The golden set -euo pipefail, EXIT signal cleanup traps, idempotent mutations, and dry-run switches.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 flex items-center space-x-1">
                <span>Read Runbook</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>

            <a
              href="https://github.com/iemafzalhassan/ops-vault/blob/main/docs/beginner-guides/03-python-for-infrastructure.md"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-xl bg-[#0b0e14] hover:bg-[#0f141f] border border-white/[0.06] hover:border-white/[0.15] transition flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono text-amber-400 mb-2 block font-semibold">
                  RUNBOOK // 03
                </span>
                <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-amber-300 transition">
                  Python for Zero-Pip Systems
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Writing zero-dependency automation scripts using standard libraries (json, urllib, argparse, subprocess).
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400 flex items-center space-x-1">
                <span>Read Runbook</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>
          </div>
        </section>

        {/* Community Contribution Section */}
        <section className="pt-8 border-t border-white/[0.08] text-center max-w-2xl mx-auto space-y-4">
          <div className="text-[11px] font-mono text-slate-500 uppercase">
            // OPEN CONTRIBUTIONS WELCOME
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Built an automation that saved your team?
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fork the repository, add your battle-tested script with an explanation of the incident it prevented, and submit a Pull Request.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2 font-mono text-xs">
            <a
              href="https://github.com/iemafzalhassan/ops-vault/fork"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded bg-white text-slate-950 font-semibold hover:bg-slate-200 flex items-center space-x-2 transition"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Fork ops-vault</span>
            </a>
            <a
              href="https://github.com/iemafzalhassan/ops-vault/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] flex items-center space-x-2 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Contribution Guide</span>
            </a>
          </div>
        </section>
      </main>

      {/* Engineering Footer */}
      <footer className="border-t border-white/[0.08] py-8 bg-[#06080d] text-[11px] font-mono text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">OpsVault</span>
            <span>·</span>
            <span>MIT Licensed Open Source</span>
          </div>

          <div className="flex items-center space-x-4">
            <a href="https://github.com/iemafzalhassan/ops-vault" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition">
              GitHub Repo
            </a>
            <a href="https://ops-vault-sand.vercel.app" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition">
              Vercel Production
            </a>
            <span className="text-slate-600">Forged for on-call engineers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
