# 🐳 Safe Docker System Prune Utility

> **Target Role:** DevOps Engineer / CI/CD Automation  
> **Technologies:** Docker CLI, Bash, Linux Coreutils  
> **Difficulty:** Intermediate  
> **Enterprise Level:** Production-Hardened  

---

## 💥 The Real-World Incident Story

Your engineering organization relies on self-hosted GitHub Actions or GitLab CI runners. During a high-stakes Friday production deployment, all builds suddenly fail with:

```
No space left on device: failed to register layer: devicemapper
```

Engineers run `docker system prune -a --volumes -f` blindly, which accidentally wipes out newly pulled base images, local development database volumes, and causes all concurrent builds to crash!

**The Fix:** This script enforces **threshold-driven pruning**. It monitors your Docker storage disk usage and only triggers cleanup when utilization reaches an alarm threshold (e.g. 75%+). Crucially, it preserves recent layers and running assets by enforcing `--filter "until=24h"`.

---

## 🧰 Key Flags & Docker Pruning Concepts Explained

| Docker Command / Flag | What It Does | Why It Prevents Production Outages |
| :--- | :--- | :--- |
| `docker info --format '{{.DockerRootDir}}'` | Extracts the exact storage root (usually `/var/lib/docker`). | Accurately targets the filesystem Docker lives on, even if it is on a mounted secondary NVMe drive. |
| `docker container prune --filter "until=24h"` | Deletes stopped containers older than 24 hours. | Does not delete containers that stopped 5 minutes ago during an ongoing CI debug session! |
| `docker image prune --filter "dangling=true"` | Only deletes untagged `<none>` images. | Keeps your official base images (`alpine:latest`, `python:3.11`) cached so future pipeline runs stay fast. |
| `docker builder prune` | Clears BuildKit build cache. | Frees up gigabytes of intermediate compiler cache without affecting running containers. |

---

## 📖 Usage Examples

```bash
# Test with Dry-Run mode (Simulates everything, deletes nothing)
./safe_prune.sh --dry-run --force

# Normal usage (only prunes if disk >= 80%)
./safe_prune.sh --threshold 80

# Configure as an automated cronjob on your CI/CD runner:
# Runs every 6 hours
0 */6 * * * /opt/scripts/safe_prune.sh --threshold 85 >> /var/log/docker-prune.log 2>&1
```
