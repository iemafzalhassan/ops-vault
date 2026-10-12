# Track 3: Python for Infrastructure & Cloud Automation

While Bash is the king of quick local pipes and file manipulations, **Python** is the industry standard for cloud SDKs (AWS `boto3`, Google Cloud, Azure), interacting with REST APIs, and handling structured JSON data.

This guide teaches non-IT and junior engineers how to transition from Bash to writing clean, reliable Python automation scripts.

---

## 1. When to Use Bash vs. Python?

| Scenario | Best Choice | Why? |
| :--- | :--- | :--- |
| Quick file renaming, piping `grep`, `awk`, `sed` | **Bash** | Native to Linux, zero runtime overhead. |
| Making HTTP requests and parsing complex JSON APIs | **Python** | Python's `json` and `urllib` / `requests` libraries prevent quoting bugs. |
| AWS / GCP / Azure resource management | **Python** | Cloud providers maintain first-class Python SDKs (`boto3`, etc.). |
| Complex data structures (dictionaries, nested objects) | **Python** | Bash associative arrays are brittle and hard to maintain. |
| Performance-sensitive Kubernetes operators | **Go (Golang)** | Static binaries, fast execution, native K8s client-go. |

---

## 2. The Python Infrastructure Skeleton

A production Python utility should always have:
1. `argparse` for CLI flags.
2. Standard `logging` configuration.
3. Strict error catching with meaningful exit codes.

```python
#!/usr/bin/env python3
"""
Production Python Automation Template
"""
import sys
import argparse
import logging

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("ops-tool")

def parse_args():
    parser = argparse.ArgumentParser(
        description="Automated Production Utility"
    )
    parser.add_argument(
        "--target-url",
        required=True,
        help="Target endpoint URL to inspect"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate the action without making permanent changes"
    )
    return parser.parse_args()

def main():
    args = parse_args()
    logger.info(f"Initiating run. Target: {args.target_url}, Dry-Run: {args.dry_run}")
    
    try:
        # Business logic goes here
        logger.info("Task completed successfully.")
        return 0
    except Exception as e:
        logger.error(f"Critical execution failure: {e}", exc_info=True)
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

---

## 3. Running Shell Commands Safely in Python (`subprocess.run`)

Sometimes you need Python to execute an existing CLI tool (like `git`, `docker`, or `kubectl`). Always use `subprocess.run` with `check=True` and avoid `shell=True` for security against command injection!

```python
import subprocess

def get_git_commit_hash() -> str:
    # Run 'git rev-parse HEAD' safely
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        capture_output=True,
        text=True,
        check=True
    )
    return result.stdout.strip()
```

---

## 4. Working with APIs & JSON (No External Dependencies Needed!)

You don't even need `pip install requests` to make simple, robust HTTPS requests. Python's built-in `urllib.request` works anywhere:

```python
import urllib.request
import json

def fetch_cluster_health(api_url: str) -> dict:
    req = urllib.request.Request(
        api_url,
        headers={"User-Agent": "OpsVault-HealthChecker/1.0"}
    )
    # Always specify a timeout to avoid hung cronjobs!
    with urllib.request.urlopen(req, timeout=10) as response:
        if response.status == 200:
            return json.loads(response.read().decode())
        raise RuntimeError(f"HTTP Status: {response.status}")
```
