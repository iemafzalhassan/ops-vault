# Contributing to OpsVault

Welcome! Whether you are a senior Principal Platform Architect, a junior DevOps engineer, or a student/career-switcher writing your very first shell script, **you belong here**.

Our mission is to build the world's most accessible, production-hardened library of real-world infrastructure automation scripts.

---

## 🌟 How Anyone Can Contribute

You don't need 10 years of Linux experience to contribute. Here are ways you can get involved today:

1. **Submit a Production Script**:
   - Have an automation script you use at work or in your homelab? Wrap it with our standard flags and submit it.
2. **Translate Cryptic Syntax (For Beginners)**:
   - Found a line in a script like `awk '{print $1}'` or `sed -i.bak`? Add a helpful beginner note explaining what each flag does.
3. **Add Safe Docker Testing Sandboxes**:
   - Write a `Dockerfile.test` so newcomers can run a script safely inside a throwaway container.
4. **Improve the Web Portal**:
   - Add new UI components, dark-mode styling, or search optimizations in `web-portal/`.

---

## 🛠️ The OpsVault Script Standard

Every script in this repository must be safe to run in enterprise production environments. Follow these rules:

### 1. For Bash Scripts (`.sh`)
```bash
#!/usr/bin/env bash
# Description: One-line explanation of what this script achieves
# Author: Your Name (@github-handle)
# Prerequisites: curl, jq, openssl

set -euo pipefail
IFS=$'\n\t'

# Safe Trap for Cleanup on Exit or Error
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        echo -e "\033[0;31m[ERROR] Script aborted unexpectedly on line $1.\033[0m" >&2
    fi
    # Cleanup any temporary files here
}
trap 'cleanup ${LINENO}' EXIT ERR INT TERM
```

### 2. For Python Scripts (`.py`)
- Use `argparse` for clear CLI documentation and help flags (`--help`).
- Always handle standard network timeouts (e.g., `requests.get(url, timeout=10)`).
- Provide structured log levels using Python's standard `logging` module.

### 3. Dry-Run Support (`--dry-run`)
Any script that deletes, modifies, cordons, or alters production state **must** support a `--dry-run` or `-n` flag so engineers can verify what *would* happen before executing.

---

## 📁 Required Folder Anatomy for New Scripts

Every script is organized inside its target role directory under `scripts/<role>/<script-name>/`:

```
scripts/<role>/<script-name>/
├── script_name.sh           # Main executable script
├── script_name.py           # Optional Python equivalent
├── Dockerfile.test          # Isolated Docker container for testing
└── README.md                # Explanatory guide & beginner breakdown
```

### What goes in the `README.md`?
- **What this script solves**: The real-world production incident or toil it prevents.
- **Key Tools & Libraries**: Explanations of `jq`, `boto3`, `awk`, etc.
- **How to Test Safely**: Copy-paste Docker command for local sandbox testing.
- **Line-by-Line Breakdown**: Friendly explanations for junior engineers and learners.

---

## 🚀 Step-by-Step Contribution Workflow

1. **Fork the Repository**:
   Click the **Fork** button on GitHub to create your own copy.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/ops-script-vault.git
   cd ops-script-vault
   ```
3. **Create a descriptive feature branch**:
   ```bash
   git checkout -b feat/sre-k8s-pod-restart-triage
   ```
4. **Add your script & guide**:
   Follow the directory structure above.
5. **Run Local Checks**:
   - ShellCheck: `shellcheck scripts/<role>/<script-name>/*.sh`
   - Python: `python3 -m compileall scripts/`
6. **Commit & Push**:
   ```bash
   git add .
   git commit -m "feat(sre): add k8s pod restart triage script and guide"
   git push origin feat/sre-k8s-pod-restart-triage
   ```
7. **Open a Pull Request**:
   Go to GitHub and click **Open Pull Request**. Fill out the checklist—our maintainers will promptly review and help you get it merged!

---

## 🎓 Contributor Hall of Fame

Every merged PR automatically adds you to our community contributors list. Thank you for making production engineering open and accessible to all!
