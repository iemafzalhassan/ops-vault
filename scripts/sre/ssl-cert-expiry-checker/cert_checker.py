#!/usr/bin/env python3
"""
Script: cert_checker.py
Role: Site Reliability Engineering (SRE)
Description: Inspects TLS/SSL certificates over TCP/SNI and checks expiry dates.
             Dispatches webhook notifications and formats structured JSON.
Prerequisites: Python 3.8+ (Zero external dependencies)
"""

import sys
import ssl
import socket
import json
import logging
import argparse
from datetime import datetime, timezone
import urllib.request
import urllib.error

# Structured Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("cert-checker")

def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Inspect TLS/SSL certificate expiration for target domains."
    )
    parser.add_argument(
        "domains",
        nargs="+",
        help="List of domain names to inspect (e.g., google.com github.com)"
    )
    parser.add_argument(
        "-w", "--warning-days",
        type=int,
        default=14,
        help="Days remaining threshold to trigger alert (default: 14)"
    )
    parser.add_argument(
        "-p", "--port",
        type=int,
        default=443,
        help="Target port (default: 443)"
    )
    parser.add_argument(
        "--webhook",
        help="Slack or Discord webhook URL for alert notifications"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format"
    )
    parser.add_argument(
        "-n", "--dry-run",
        action="store_true",
        help="Simulate execution without sending live webhook alerts"
    )
    return parser.parse_args()

def check_domain_cert(domain: str, port: int) -> dict:
    """Connects via SSL/TLS and extracts certificate expiration."""
    context = ssl.create_default_context()
    
    try:
        with socket.create_connection((domain, port), timeout=10.0) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                # Format: 'May 15 12:00:00 2026 GMT'
                expire_str = cert["notAfter"]
                expire_date = datetime.strptime(expire_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                now = datetime.now(timezone.utc)
                
                delta = expire_date - now
                days_left = delta.days
                
                return {
                    "domain": domain,
                    "status": "VALID",
                    "expiry_date": expire_date.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "days_remaining": days_left,
                    "error": None
                }
    except Exception as e:
        return {
            "domain": domain,
            "status": "ERROR",
            "expiry_date": None,
            "days_remaining": -1,
            "error": str(e)
        }

def send_webhook(webhook_url: str, domain: str, days_left: int, expiry_str: str, dry_run: bool):
    """Sends webhook notification to Slack/Discord."""
    payload = {
        "text": f"🚨 *SSL Expiry Warning*: `{domain}` expires in *{days_left}* days (on `{expiry_str}`)!"
    }
    data = json.dumps(payload).encode("utf-8")
    
    if dry_run:
        logger.info(f"[DRY-RUN] Would send webhook for {domain}: {payload}")
        return

    try:
        req = urllib.request.Request(
            webhook_url,
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "OpsVault-CertChecker/1.0"}
        )
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            logger.info(f"Webhook alert dispatched for {domain}. HTTP Status: {resp.status}")
    except Exception as e:
        logger.warning(f"Failed to deliver webhook alert: {e}")

def main():
    args = parse_arguments()
    results = []
    has_critical = False

    for domain in args.domains:
        res = check_domain_cert(domain, args.port)
        results.append(res)
        
        if res["status"] == "ERROR":
            has_critical = True
            if not args.json:
                logger.error(f"{domain} -> Connection Failed: {res['error']}")
        else:
            days = res["days_remaining"]
            if days <= args.warning_days:
                has_critical = True
                if not args.json:
                    logger.warning(f"{domain} -> EXPIRES SOON! {days} days left ({res['expiry_date']})")
                if args.webhook:
                    send_webhook(args.webhook, domain, days, res["expiry_date"], args.dry_run)
            else:
                if not args.json:
                    logger.info(f"{domain} -> HEALTHY. {days} days left ({res['expiry_date']})")

    if args.json:
        print(json.dumps(results, indent=2))

    return 1 if has_critical else 0

if __name__ == "__main__":
    sys.exit(main())
