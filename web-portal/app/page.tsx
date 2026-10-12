"use client";

import React, { useState, useMemo } from "react";
import { 
  Terminal, ShieldCheck, Cpu, Database, Wrench, Sparkles, 
  Search, Copy, Check, ExternalLink, Play, BookOpen, 
  GitFork, Star, AlertTriangle, Layers, ArrowRight, Code2
} from "lucide-react";
import { SCRIPTS_DATA, ScriptItem } from "../data/scripts";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [activeScript, setActiveScript] = useState<ScriptItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedDocker, setCopiedDocker] = useState(false);

  // Script Generator State
  const [genDomain, setGenDomain] = useState("api.example.com");
  const [genWarningDays, setGenWarningDays] = useState(14);
  const [genDryRun, setGenDryRun] = useState(false);
  const [genWebhook, setGenWebhook] = useState("https://hooks.slack.com/services/XXX");

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  // Generated code output
  const generatedCode = useMemo(() => {
    return `#!/usr/bin/env bash
# OpsVault Custom Generated SSL Expiry Checker
set -euo pipefail

TARGET_DOMAIN="${genDomain}"
WARNING_DAYS=${genWarningDays}
WEBHOOK_URL="${genWebhook}"
DRY_RUN=${genDryRun}

echo "[INFO] Inspecting TLS certificate for: \${TARGET_DOMAIN}..."
cert_raw=$(echo | openssl s_client -servername "\${TARGET_DOMAIN}" -connect "\${TARGET_DOMAIN}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null || true)
expiry_str="\${cert_raw#notAfter=}"
expiry_epoch=$(date -d "\${expiry_str}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "\${expiry_str}" +%s 2>/dev/null)
days_remaining=$(( (expiry_epoch - $(date +%s)) / 86400 ))

echo "[INFO] Days remaining: \${days_remaining} (Expires on: \${expiry_str})"

if [[ \${days_remaining} -le \${WARNING_DAYS} ]]; then
    payload="{\\"text\\": \\"🚨 SSL Warning: \${TARGET_DOMAIN} expires in \${days_remaining} days!\\"}"
    if [[ "\${DRY_RUN}" == "true" ]]; then
        echo "[DRY-RUN] Would post webhook: \${payload}"
    else
        curl -s -X POST -H 'Content-Type: application/json' -d "\${payload}" "\${WEBHOOK_URL}"
    fi
fi`;
  }, [genDomain, genWarningDays, genDryRun, genWebhook]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0c1220]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-mono font-bold text-lg">
              &gt;_
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                OpsVault
              </span>
              <span className="ml-2 text-xs font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                v1.0 Production
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <a href="#scripts" className="hover:text-emerald-400 transition-colors">Catalog</a>
            <a href="#generator" className="hover:text-emerald-400 transition-colors">Generator</a>
            <a href="#learning" className="hover:text-emerald-400 transition-colors">Beginner Tracks</a>
            <a href="#contribute" className="hover:text-emerald-400 transition-colors">Contribute</a>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Deploy on Vercel</span>
            </a>
            <a
              href="https://github.com/iemafzalhassan/ops-script-vault"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-slate-800/60 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Source Enterprise Automation &amp; Educational Hub</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            The Production Script Vault <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Built for Real-World Infrastructure
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Battle-tested automation scripts across <strong className="text-emerald-300 font-medium">SRE, DevOps, Platform Ops, and Support</strong>. 
            Explained line-by-line with safe <strong className="text-cyan-300 font-medium">Docker test sandboxes</strong> so students and career changers can learn and build with confidence.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scripts by keyword, tool (jq, openssl, k8s, docker), or incident..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xl transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {["All", "SRE", "DevOps", "Platform Ops", "Support", "DevRel"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedRole === role
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                {role}
              </button>
            ))}
            <span className="text-slate-600 px-1">|</span>
            {["All", "Beginner", "Intermediate", "Production Pro"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedDifficulty === diff
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800/80"
                }`}
              >
                {diff === "All" ? "All Levels" : diff}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Script Catalog Grid */}
      <section id="scripts" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Layers className="w-6 h-6 text-emerald-400" />
              <span>Production Scripts Catalog</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Showing {filteredScripts.length} verified production-hardened automations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-emerald-500/5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    script.role === "SRE" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                    script.role === "DevOps" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    script.role === "Platform Ops" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                    script.role === "Support" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {script.role}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {script.language}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors mb-2">
                  {script.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {script.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {script.tags.map(t => (
                    <span key={t} className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveScript(script)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 transition"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Inspect Code &amp; Guide</span>
                </button>

                <button
                  onClick={() => handleCopy(script.code, script.id)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Copy Script Code"
                >
                  {copiedId === script.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Script Detail Modal */}
      {activeScript && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {activeScript.role}
                  </span>
                  <span className="text-xs text-slate-400">/ {activeScript.path}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{activeScript.title}</h3>
              </div>
              <button
                onClick={() => setActiveScript(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Incident Story */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold flex items-center space-x-2 text-amber-300 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Real-World Production Incident Story</span>
                </h4>
                <p className="text-sm leading-relaxed text-slate-300">
                  {activeScript.incidentStory}
                </p>
              </div>

              {/* Tools Explained */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Key Tools &amp; Commands Explained (For Beginners)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeScript.toolsExplained.map((tool, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="font-mono text-xs font-bold text-emerald-400 mb-1">{tool.tool}</div>
                      <div className="text-xs text-slate-300">{tool.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safe Docker Sandbox Command */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Run in Safe Isolated Docker Container</span>
                </h4>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {activeScript.dockerSandbox}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeScript.dockerSandbox);
                      setCopiedDocker(true);
                      setTimeout(() => setCopiedDocker(false), 2000);
                    }}
                    className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-mono flex items-center space-x-1"
                  >
                    {copiedDocker ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDocker ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Source Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Script Source Code</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(activeScript.code, "modal-copy")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-mono"
                  >
                    {copiedId === "modal-copy" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "modal-copy" ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  {activeScript.code}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Script Generator */}
      <section id="generator" className="py-16 bg-[#0c1220] border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Generator</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              Customize &amp; Export Your Script
            </h2>
            <p className="text-sm text-slate-400">
              Configure parameters visually and get an enterprise-hardened automation snippet instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Parameters Form */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider text-emerald-400">
                1. Configure Parameters
              </h3>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Domain</label>
                <input
                  type="text"
                  value={genDomain}
                  onChange={(e) => setGenDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Warning Days Threshold: {genWarningDays} days</label>
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
                <label className="block text-xs font-mono text-slate-400 mb-1">Webhook URL</label>
                <input
                  type="text"
                  value={genWebhook}
                  onChange={(e) => setGenWebhook(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="dryRunToggle"
                  checked={genDryRun}
                  onChange={(e) => setGenDryRun(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <label htmlFor="dryRunToggle" className="text-xs font-mono text-slate-300">
                  Enable Dry-Run Mode (--dry-run)
                </label>
              </div>
            </div>

            {/* Live Generated Code */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-emerald-400 flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>custom_cert_checker.sh</span>
                </span>
                <button
                  onClick={() => handleCopy(generatedCode, "gen-copy")}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition"
                >
                  {copiedId === "gen-copy" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "gen-copy" ? "Copied" : "Copy Generated Code"}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                {generatedCode}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Zero to Hero Learning Section */}
      <section id="learning" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Structured Pathways</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
            Zero-to-Hero Learning Tracks
          </h2>
          <p className="text-sm text-slate-400">
            For students, career changers, and junior support engineers ready to break into DevOps and SRE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-4 font-mono">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Track 1: Shell Foundations</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Master the shebang, variables, pipes, standard streams (stdin/stdout/stderr), and exit codes without confusing jargon.
            </p>
            <a
              href="https://github.com/iemafzalhassan/ops-script-vault/blob/main/docs/beginner-guides/01-bash-scripting-fundamentals.md"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>Read Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4 font-mono">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Track 2: Production Hardening</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Learn the golden standard: `set -euo pipefail`, signal traps, idempotent design, and the vital `--dry-run` safety switch.
            </p>
            <a
              href="https://github.com/iemafzalhassan/ops-script-vault/blob/main/docs/beginner-guides/02-production-hardening-rules.md"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Read Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold mb-4 font-mono">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Track 3: Python Infrastructure</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Graduate from Bash to Python CLI scripts, handling cloud APIs, structured JSON parsing, and subprocess management safely.
            </p>
            <a
              href="https://github.com/iemafzalhassan/ops-script-vault/blob/main/docs/beginner-guides/03-python-for-infrastructure.md"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>Read Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Community Contribution Section */}
      <section id="contribute" className="py-16 bg-[#0c1220] border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <GitFork className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            Build Something From Your Mind &amp; Contribute
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Have a script you use at your company, homelab, or university? Whether you are a student or a staff engineer, 
            submit your automation and get featured in the community Hall of Fame!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://github.com/iemafzalhassan/ops-script-vault/fork"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
            >
              <GitFork className="w-4 h-4" />
              <span>Fork Repository on GitHub</span>
            </a>
            <a
              href="https://github.com/iemafzalhassan/ops-script-vault/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition border border-slate-700 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Contributor Guide</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-[#090d16] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>
            OpsVault is open-source under the MIT License. Hosted effortlessly on Vercel.
          </p>
          <p className="mt-1 font-mono text-slate-600">
            Engineered for high reliability, zero fluff, and radical accessibility.
          </p>
        </div>
      </footer>
    </div>
  );
}
