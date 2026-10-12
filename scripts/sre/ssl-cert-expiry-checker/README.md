# 🛡️ SSL/TLS Certificate Expiry Checker

> **Target Role:** Site Reliability Engineering (SRE) / Infrastructure Ops  
> **Languages:** Bash (`cert_checker.sh`), Python (`cert_checker.py`)  
> **Difficulty:** Intermediate  
> **Enterprise Level:** Production-Hardened  

---

## 💥 The Real-World Incident Story

It is 2:15 AM on a Saturday. Your company's mobile app and payment gateway suddenly crash with `SSL_ERROR_CERT_EXPIRED`. Customers cannot check out, revenue drops to zero, and the executive team is paged.

**Root Cause:** A wildcard TLS certificate on the API gateway expired silently because nobody had automated monitoring in place.

This script runs on a daily cronjob or Kubernetes job, queries your public and internal endpoints over SNI, calculates the exact days remaining, and sends proactive alerts to Slack, Discord, or Datadog weeks before expiration.

---

## 🧰 Key Tools & Libraries Explained

For non-IT learners and junior engineers, here is what is happening under the hood:

| Tool / Module | What It Does | Why We Use It Here |
| :--- | :--- | :--- |
| `openssl s_client` | An SSL/TLS client utility included on virtually all Unix systems. | Connects to a remote server over TLS and negotiates the certificate handshake. |
| `-servername` | Sets the SNI (Server Name Indication) header. | Necessary when multiple websites are hosted on a single IP address (e.g., Cloudflare or AWS ALB). |
| `openssl x509` | A certificate display and signing utility. | Reads the raw cryptographic certificate and extracts the human-readable `notAfter` expiration timestamp. |
| `curl` | Command-line HTTP transfer utility. | Sends the JSON alert payload to your team's Slack or Discord webhook. |
| Python `ssl` & `socket` | Standard networking libraries in Python. | Connects over TCP and TLS without requiring external packages like `requests` or `pyOpenSSL`. |

---

## 🧪 Safe Sandbox: Test in Docker (Zero Risk)

You do **not** need to install anything on your personal computer. Run this script in an isolated Docker container:

```bash
# Build the safe test container
docker build -t cert-checker-test -f scripts/sre/ssl-cert-expiry-checker/Dockerfile.test scripts/sre/ssl-cert-expiry-checker

# Run it
docker run --rm cert-checker-test
```

---

## 📖 Quick Usage

### Bash:
```bash
# Basic check for multiple domains
./cert_checker.sh google.com github.com

# Custom warning threshold (e.g. 30 days) and send Slack alert
./cert_checker.sh --warning-days 30 --webhook "https://hooks.slack.com/services/XXX" api.mycompany.com

# Machine-readable JSON output (great for Prometheus / Grafana / Datadog)
./cert_checker.sh --json google.com
```

### Python:
```bash
python3 cert_checker.py --warning-days 14 --json google.com github.com
```

---

## 🔍 Line-by-Line Code Breakdown (For Beginners)

Let's dissect this critical line in `cert_checker.sh`:

```bash
cert_end_raw=$(echo | openssl s_client -servername "${domain}" -connect "${domain}:${PORT}" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null || true)
```

1. `echo |`: Normally, `openssl s_client` waits for user input interactively. Piping `echo` sends an immediate empty line to close the connection once the TLS handshake finishes.
2. `-servername "${domain}"`: Sends the target hostname in the TLS client hello (SNI).
3. `2>/dev/null`: Silences any connection noise or handshake warnings from clogging up your screen.
4. `| openssl x509 -noout -enddate`: Passes the certificate into the x509 parser and requests *only* the expiration date (`notAfter=...`).
5. `|| true`: Prevents `set -e` from aborting the entire script if a single domain fails to connect.
