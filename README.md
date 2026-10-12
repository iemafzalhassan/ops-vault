<div align="center">

# ⚡ OpsVault: The Enterprise Production Script Hub
### *Battle-Tested Automation for SRE, DevOps, Platform Ops, Support & DevRel*

[![MIT License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)
[![Production Hardened](https://img.shields.io/badge/Production-Hardened-blue.svg)](docs/beginner-guides/02-production-hardening-rules.md)
[![Safe Docker Sandboxes](https://img.shields.io/badge/Docker-Sandbox%20Included-cyan.svg)](#-safe-testing-sandbox-run-anywhere-with-zero-risk)
[![Vercel Hosted](https://img.shields.io/badge/Web%20Portal-Vercel%20Ready-black.svg?logo=vercel)](web-portal/)

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiemafzalhassan%2Fops-script-vault">
    <img src="https://vercel.com/button" alt="Deploy with Vercel"/>
  </a>
</p>

**Explore the Live Interactive Portal:** [ops-vault-sand.vercel.app](https://ops-vault-sand.vercel.app) (or deploy in 1-click above!)

---

</div>

## 🎯 What is OpsVault?

Most production automation scripts are locked inside proprietary enterprise wikis or scattered across outdated StackOverflow answers without safety guardrails.

**OpsVault** is an open-source, community-driven library of **real-world production automation scripts** used on live enterprise servers, Kubernetes clusters, and cloud environments.

### 💡 Why It Is Radically Different:
1. **Production-Hardened Standard**: Every script includes `set -euo pipefail`, `--dry-run` safety switches, automated error traps, and structured logging.
2. **Safe Docker Sandboxes**: Every script can be tested inside an isolated, throwaway Docker container with 1 command—so you never risk your local workstation.
3. **Beginner & Non-IT Friendly**: Every script includes a plain-English breakdown of cryptic tools (`awk`, `sed`, `jq`, `openssl`, `kubectl`, `boto3`) and the real-world production incident it prevents.
4. **Interactive Web Portal on Vercel**: Search, filter by role, test snippets, and dynamically generate custom automation scripts from any browser.

---

## 🧭 Scripts Catalog by Role

| Role | Script Name | Language | Real-World Scenario Solved | Safe Test Sandbox |
| :--- | :--- | :--- | :--- | :--- |
| **SRE** | [SSL Cert Expiry Checker](scripts/sre/ssl-cert-expiry-checker/) | Bash / Python | Prevents catastrophic middle-of-the-night TLS expiry outages with webhook alerts | `docker run --rm alpine:3.20 ...` |
| **Platform Ops** | [K8s PV Log Cleaner CronJob](scripts/platform-ops/k8s-cronjob-log-cleaner/) | K8s YAML / Bash | Prevents `NodeHasDiskPressure` pod evictions by auto-compressing and pruning persistent volume logs | `kubectl apply -f ...` |
| **DevOps** | [Safe Docker System Pruner](scripts/devops/docker-system-prune-safe/) | Bash | Prevents CI/CD runner disk exhaustion while preserving recent layers and rollback targets | `./safe_prune.sh --dry-run` |
| **Support** | [Emergency Disk Recovery](scripts/support/disk-space-emergency-purge/) | Bash | Rescues 100% full Linux servers using `truncate -s 0` to fix the unlinked open file gotcha | `./disk_purge.sh --dry-run` |
| **DevRel** | [Workstation Doctor & Auditor](scripts/devrel/developer-env-doctor/) | Bash | Scans developer laptops in 3s and outputs exact commands to fix missing toolchains | `bash <(curl -s ...)` |

---

## 🧪 Safe Testing Sandbox: Run Anywhere with Zero Risk

You never need to fear breaking your personal computer. Every script includes an isolated Docker command.

For example, to test the **SSL Certificate Expiry Checker**:
```bash
docker run --rm alpine:3.20 /bin/sh -c '
  apk add --no-cache bash curl openssl && 
  curl -fsSL https://raw.githubusercontent.com/iemafzalhassan/ops-script-vault/main/scripts/sre/ssl-cert-expiry-checker/cert_checker.sh | bash -s -- --warning-days 30 google.com github.com
'
```

---

## 🎓 Zero-to-Hero Learning Tracks (For Students & Beginners)

New to coding or transitioning from non-IT into DevOps or SRE? We built structured learning pathways to guide you step-by-step:

- 📘 **[Track 1: Bash Scripting Fundamentals](docs/beginner-guides/01-bash-scripting-fundamentals.md)**  
  *Shebangs, variables, pipelines (`|`), standard streams (`stdin`, `stdout`, `stderr`), and exit codes.*
- 🛡️ **[Track 2: Production Hardening Rules](docs/beginner-guides/02-production-hardening-rules.md)**  
  *The golden `set -euo pipefail`, signal traps, idempotent execution, and the `--dry-run` safety switch.*
- 🐍 **[Track 3: Python for Cloud & Infrastructure](docs/beginner-guides/03-python-for-infrastructure.md)**  
  *Handling APIs, parsing JSON cleanly, argument parsing with `argparse`, and executing CLI tools safely.*

---

## ⚡ The Enterprise Production Standard

Every script in OpsVault adheres to the 5 enterprise pillars:

```bash
#!/usr/bin/env bash
# 1. Strict Error Handling & Unset Variable Traps
set -euo pipefail
IFS=$'\n\t'

# 2. Automated Cleanup on Exit or Failure
cleanup() {
    local exit_code=$?
    # Automatically clean up temporary files
}
trap cleanup EXIT INT TERM

# 3. Dry-Run Safety Switch
if [[ "${DRY_RUN:-false}" == "true" ]]; then
    echo "[DRY-RUN] Would execute destructive command..."
fi

# 4. Structured Timestamped Logging
log_info()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO]  $*"; }
log_warn()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARN]  $*"; }
log_error() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2; }
```

---

## 🌐 Deploy the Interactive Web Portal to Vercel

The included web portal is built with **Next.js 15 (App Router)** and **Tailwind CSS**.

### 1-Click Deployment:
Click the **Deploy with Vercel** button above, or deploy manually:

```bash
cd web-portal
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🤝 Build Something From Your Mind & Contribute!

Whether you have a 5-line bash helper or a complex Kubernetes failover operator:
1. **Fork the repo**
2. Add your script under `scripts/<role>/<script-name>/`
3. Add a simple `README.md` explaining the problem and a `Dockerfile.test`
4. Open a Pull Request!

Check out our **[Contributing Guide](CONTRIBUTING.md)** to get started!

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.
