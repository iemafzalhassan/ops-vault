# 🩺 Developer Environment Doctor & Workstation Validator

> **Target Role:** DevRel / Developer Experience / Student Onboarding  
> **Technologies:** Bash, POSIX, Cross-Platform Detection (macOS, Ubuntu, Debian, Arch)  
> **Difficulty:** Beginner  
> **Enterprise Level:** Production-Hardened  

---

## 💥 The Real-World Incident Story

A new software engineering intern or open-source contributor joins your project. They spend the first 3 days struggling with:
- "My Node.js version is too old"
- "Why does Docker give me `permission denied`?"
- "I don't have Kubectl installed"
- "Git commits aren't signed or have no author name"

This friction leads to frustration, lost productivity, and abandoned pull requests.

**The Fix:** A single command:
```bash
curl -fsSL https://raw.githubusercontent.com/iemafzalhassan/ops-script-vault/main/scripts/devrel/developer-env-doctor/doctor.sh | bash
```
It immediately scans their system, validates disk space and Git credentials, checks all development runtimes, and gives them the exact, one-liner copy-paste command to install whatever is missing based on their specific operating system.

---

## 🧰 What It Checks

1. **System Architecture**: Validates OS and warns if disk space is critically low (< 10GB).
2. **Git Credentials**: Checks whether `user.name` and `user.email` are configured so commits aren't attributed anonymously.
3. **Core Toolchains**:
   - Git
   - Python 3
   - Node.js & npm
   - Docker CLI & Daemon
   - Kubectl

---

## 📖 Usage Examples

```bash
# Run locally
./doctor.sh

# Run directly from GitHub in 1 command:
bash <(curl -s https://raw.githubusercontent.com/iemafzalhassan/ops-script-vault/main/scripts/devrel/developer-env-doctor/doctor.sh)
```
