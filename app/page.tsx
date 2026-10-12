"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Terminal, Shield, Cpu, HardDrive, Wrench, Sparkles, 
  Search, Copy, Check, ExternalLink, Play, BookOpen, 
  GitFork, Star, AlertCircle, ArrowUpRight, Code, Download,
  Sliders, ChevronRight, X, Heart
} from "lucide-react";
import { SCRIPTS_DATA, ScriptItem } from "../data/scripts";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [activeScript, setActiveScript] = useState<ScriptItem | null>(null);
  const [modalTab, setModalTab] = useState<"code" | "incident" | "tools" | "sandbox">("code");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Script Generator State
  const [genDomain, setGenDomain] = useState("api.example.com");
  const [genWarningDays, setGenWarningDays] = useState(14);
  const [genDryRun, setGenDryRun] = useState(true);
  const [genWebhook, setGenWebhook] = useState("https://hooks.slack.com/services/XXX");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: press '/' to focus search, 'Escape' to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current && !activeScript) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape" && activeScript) {
        setActiveScript(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeScript]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeScript) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeScript]);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
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
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === "All" || item.role === selectedRole;
      const matchesDiff = selectedDifficulty === "All" || item.difficulty === selectedDifficulty;

      return matchesSearch && matchesRole && matchesDiff;
    });
  }, [searchQuery, selectedRole, selectedDifficulty]);

  // Counts by role
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
# Generated via OpsVault (https://opsvault.vercel.app)
# Description: Automated SSL/TLS expiration check for \${TARGET_DOMAIN}
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
        echo "[DRY-RUN] Would send webhook: \${payload}"
    else
        echo "[ALERT] Dispatching webhook..."
        curl -s -X POST -H 'Content-Type: application/json' -d "\${payload}" "\${WEBHOOK_URL}"
    fi
fi
`;
  }, [genDomain, genWarningDays, genDryRun, genWebhook]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090c13] text-slate-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-medium text-xs shadow-xl shadow-emerald-500/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimalist Top Navigation */}
      <header className="border-b border-slate-800/60 bg-[#090c13]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-sm font-semibold">
              &gt;
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm tracking-tight text-white">OpsVault</span>
              <span className="text-[11px] font-mono text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">v1.0</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs text-slate-400">
            <a href="#scripts" className="hover:text-white transition">Scripts</a>
            <a href="#generator" className="hover:text-white transition">Generator</a>
            <a href="#learning" className="hover:text-white transition">Guides</a>
            <a href="#contribute" className="hover:text-white transition">Contribute</a>
          </nav>

          <div className="flex items-center space-x-2.5">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-800 transition"
            >
              <span>Deploy on Vercel</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href="https://github.com/iemafzalhassan/ops-vault"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 text-[11px] font-semibold transition"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Star</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean, Human, Uncluttered */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Curated scripts for real enterprise servers &amp; Kubernetes</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-5 leading-tight">
          The production scripts we wish we had <br className="hidden sm:inline" />
          during our 3 AM outages.
        </h1>

        <p className="text-base text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Battle-tested automations across <span className="text-slate-200">SRE, DevOps, Platform Ops, and Support</span>. 
          Annotated line-by-line with safe Docker sandboxes so students and career changers can learn without breaking things.
        </p>

        {/* Minimal Search Bar */}
        <div className="max-w-xl mx-auto relative mb-6">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by tool (jq, openssl, docker, kubectl) or role..."
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 transition"
            />
            <div className="absolute right-3.5 pointer-events-none text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              /
            </div>
          </div>
        </div>

        {/* Clean Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl mx-auto">
          {["All", "SRE", "DevOps", "Platform Ops", "Support", "DevRel"].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                selectedRole === role
                  ? "bg-slate-200 text-slate-950 font-semibold"
                  : "bg-slate-900/60 hover:bg-slate-900 text-slate-400 border border-slate-800/80"
              }`}
            >
              <span>{role}</span>
              <span className={`text-[10px] ${selectedRole === role ? "text-slate-600" : "text-slate-600"}`}>
                {roleCounts[role] || 0}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Scripts Grid */}
      <section id="scripts" className="py-8 max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/60">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <span>Verified Scripts</span>
            <span className="text-slate-500">({filteredScripts.length})</span>
          </h2>
          <div className="text-xs text-slate-500">
            Click any card to inspect code &amp; incident breakdown
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScripts.length === 0 ? (
            <div className="col-span-full py-16 px-4 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">No matching scripts found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
                No scripts matched &quot;{searchQuery}&quot; under the &quot;{selectedRole}&quot; filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRole("All");
                  setSelectedDifficulty("All");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredScripts.map((script) => (
              <div
                key={script.id}
                onClick={() => {
                  setActiveScript(script);
                  setModalTab("code");
                }}
                className="cursor-pointer group bg-[#0e131f] hover:bg-[#121827] border border-slate-800/80 hover:border-slate-700 rounded-xl p-5 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {script.role}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {script.language}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors mb-2">
                    {script.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {script.summary}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {script.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                    <span className="group-hover:text-slate-300 transition flex items-center space-x-1">
                      <span>Inspect details</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(script.code, `Copied ${script.title}`);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      title="Quick Copy Code"
                      aria-label={`Copy code for ${script.title}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Script Detail Drawer / Modal */}
      {activeScript && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveScript(null)}
        >
          <div 
            className="bg-[#0b0f17] border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/40">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {activeScript.role}
                  </span>
                  <span className="text-xs text-slate-500">{activeScript.path}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{activeScript.title}</h3>
              </div>
              <button
                onClick={() => setActiveScript(null)}
                aria-label="Close dialog"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800/80 px-5 bg-slate-900/20 text-xs">
              <button
                onClick={() => setModalTab("code")}
                className={`py-3 px-3 font-medium border-b-2 transition ${
                  modalTab === "code"
                    ? "border-emerald-400 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Source Code
              </button>
              <button
                onClick={() => setModalTab("incident")}
                className={`py-3 px-3 font-medium border-b-2 transition ${
                  modalTab === "incident"
                    ? "border-emerald-400 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Incident War Story
              </button>
              <button
                onClick={() => setModalTab("tools")}
                className={`py-3 px-3 font-medium border-b-2 transition ${
                  modalTab === "tools"
                    ? "border-emerald-400 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Tools Demystified
              </button>
              <button
                onClick={() => setModalTab("sandbox")}
                className={`py-3 px-3 font-medium border-b-2 transition ${
                  modalTab === "sandbox"
                    ? "border-emerald-400 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Docker Sandbox
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {modalTab === "code" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-500 font-mono">Executable Script</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(activeScript.code, activeScript.path.split("/").pop() || "script.sh")}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-xs flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => handleCopy(activeScript.code, "Code copied!")}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center space-x-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-slate-300 overflow-x-auto leading-relaxed text-[11px]">
                    {activeScript.code}
                  </pre>
                </div>
              )}

              {modalTab === "incident" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-slate-300 leading-relaxed">
                    <div className="font-semibold text-amber-300 mb-2 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Why This Script Was Built</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeScript.incidentStory}
                    </p>
                  </div>
                </div>
              )}

              {modalTab === "tools" && (
                <div className="space-y-3">
                  <p className="text-slate-400 mb-3">
                    Every command in this script broken down in plain English for students and learners:
                  </p>
                  {activeScript.toolsExplained.map((tool, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="font-mono font-semibold text-emerald-400 block mb-1">{tool.tool}</span>
                      <p className="text-slate-300">{tool.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {modalTab === "sandbox" && (
                <div className="space-y-3">
                  <p className="text-slate-400">
                    Test this script in an isolated Alpine/Ubuntu container without installing anything on your host:
                  </p>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap text-[11px]">
                    {activeScript.dockerSandbox}
                  </pre>
                  <button
                    onClick={() => handleCopy(activeScript.dockerSandbox, "Docker command copied!")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center space-x-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Docker One-Liner</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Script Generator */}
      <section id="generator" className="py-16 border-t border-slate-800/60 bg-[#070a10]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-1">
              Interactive Script Builder
            </h2>
            <p className="text-xs text-slate-400">
              Customize parameters to generate a production-ready SSL expiration monitor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c101a] border border-slate-800/80 rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Endpoint</label>
                <input
                  type="text"
                  value={genDomain}
                  onChange={(e) => setGenDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Alert Threshold: <span className="text-white font-bold">{genWarningDays} days</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="60"
                  value={genWarningDays}
                  onChange={(e) => setGenWarningDays(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Webhook URL</label>
                <input
                  type="text"
                  value={genWebhook}
                  onChange={(e) => setGenWebhook(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="genDryRunToggle"
                  checked={genDryRun}
                  onChange={(e) => setGenDryRun(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-emerald-500"
                />
                <label htmlFor="genDryRunToggle" className="text-xs text-slate-400">
                  Enable Dry-Run Mode (--dry-run)
                </label>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-56 leading-relaxed mb-3">
                {generatedCode}
              </pre>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(generatedCode, "cert_checker.sh")}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sh</span>
                </button>
                <button
                  onClick={() => handleCopy(generatedCode, "Generated script copied!")}
                  className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950 flex items-center justify-center space-x-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Script</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Learning Tracks */}
      <section id="learning" className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-1">
            Zero-to-Hero Guides
          </h2>
          <p className="text-xs text-slate-400">
            Plain-English guides explaining how shell and automation scripting work under the hood.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://github.com/iemafzalhassan/ops-vault/blob/main/docs/beginner-guides/01-bash-scripting-fundamentals.md"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-xl bg-[#0e131f] hover:bg-[#121827] border border-slate-800/80 transition flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-emerald-400 mb-2 block">Track 01</span>
              <h3 className="text-sm font-semibold text-white mb-1">Shell Foundations</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Shebangs, variables, pipes, standard streams (stdin/stdout/stderr), and exit codes.
              </p>
            </div>
            <span className="text-xs text-emerald-400 flex items-center space-x-1 font-medium">
              <span>Read guide</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </a>

          <a
            href="https://github.com/iemafzalhassan/ops-vault/blob/main/docs/beginner-guides/02-production-hardening-rules.md"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-xl bg-[#0e131f] hover:bg-[#121827] border border-slate-800/80 transition flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-cyan-400 mb-2 block">Track 02</span>
              <h3 className="text-sm font-semibold text-white mb-1">Production Hardening</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                The golden set -euo pipefail, signal cleanup traps, and safe dry-run switches.
              </p>
            </div>
            <span className="text-xs text-cyan-400 flex items-center space-x-1 font-medium">
              <span>Read guide</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </a>

          <a
            href="https://github.com/iemafzalhassan/ops-vault/blob/main/docs/beginner-guides/03-python-for-infrastructure.md"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-xl bg-[#0e131f] hover:bg-[#121827] border border-slate-800/80 transition flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono text-purple-400 mb-2 block">Track 03</span>
              <h3 className="text-sm font-semibold text-white mb-1">Python Infrastructure</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Moving from Bash to Python CLI scripts, handling cloud APIs and structured JSON.
              </p>
            </div>
            <span className="text-xs text-purple-400 flex items-center space-x-1 font-medium">
              <span>Read guide</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </a>
        </div>
      </section>

      {/* Community Contribution CTA */}
      <section id="contribute" className="py-16 border-t border-slate-800/60 bg-[#070a10]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Build something from your mind &amp; contribute
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            Have an automation script you use in production or at university? Submit your pull request and get featured on the community wall.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <a
              href="https://github.com/iemafzalhassan/ops-vault/fork"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-950 text-xs font-semibold flex items-center space-x-2 transition"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Fork on GitHub</span>
            </a>
            <a
              href="https://github.com/iemafzalhassan/ops-vault/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-2 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Contributor Guide</span>
            </a>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-800/60 py-6 bg-[#090c13] text-center text-[11px] text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>OpsVault · Open source under MIT License</span>
          <span className="flex items-center space-x-1">
            <span>Built with care for engineers everywhere</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
