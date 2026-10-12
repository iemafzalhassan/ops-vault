#!/usr/bin/env bash
# ==============================================================================
# Script: cert_checker.sh
# Role: Site Reliability Engineering (SRE) / Infrastructure Ops
# Description: Checks SSL/TLS certificate expiration dates for a list of domains.
#              Emits warning alerts if certificates expire within a threshold.
# Prerequisites: openssl, curl, date
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# Default configurations
DEFAULT_WARNING_DAYS=14
WARNING_DAYS="${DEFAULT_WARNING_DAYS}"
PORT=443
WEBHOOK_URL=""
JSON_OUTPUT=false
DRY_RUN=false
TARGET_DOMAINS=()

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Structured Logger
log_info()  { echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${BLUE}[INFO]${NC}  $*"; }
log_ok()    { echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${GREEN}[OK]${NC}    $*"; }
log_warn()  { echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${YELLOW}[WARN]${NC}  $*"; }
log_error() { echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] ${RED}[ERROR]${NC} $*" >&2; }

# Trap for unexpected termination
cleanup() {
    local exit_code=$?
    if [[ ${exit_code} -ne 0 ]]; then
        log_error "Certificate check terminated prematurely with code ${exit_code}."
    fi
}
trap cleanup EXIT INT TERM

# Help / Usage documentation
show_help() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS] domain1 [domain2 ...]

Options:
  -w, --warning-days <days>   Days before expiration to trigger alert (Default: ${DEFAULT_WARNING_DAYS})
  -p, --port <port>           SSL Port to connect to (Default: 443)
  --webhook <url>             Slack or Discord Incoming Webhook URL for alerts
  --json                      Output results in structured JSON format
  -n, --dry-run               Simulate execution without sending alerts
  -h, --help                  Display this help message

Examples:
  $(basename "$0") google.com github.com
  $(basename "$0") --warning-days 30 --webhook "https://hooks.slack.com/..." api.mysite.com
EOF
}

# Parse Command-Line Arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -w|--warning-days)
            WARNING_DAYS="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        --webhook)
            WEBHOOK_URL="$2"
            shift 2
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            log_error "Unknown flag: $1"
            show_help
            exit 1
            ;;
        *)
            TARGET_DOMAINS+=("$1")
            shift
            ;;
    esac
done

if [[ ${#TARGET_DOMAINS[@]} -eq 0 ]]; then
    log_error "No domains provided to check!"
    show_help
    exit 1
fi

# Function to send Slack/Discord webhook alert
send_webhook_alert() {
    local domain="$1"
    local days_left="$2"
    local expiry_date="$3"

    if [[ -z "${WEBHOOK_URL}" ]]; then
        return 0
    fi

    local payload
    payload="{\"text\": \"🚨 *SSL Certificate Expiry Warning*\\n*Domain:* \`${domain}\`\\n*Days Remaining:* *${days_left}* days\\n*Expiry Date:* \`${expiry_date}\`\"}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY-RUN] Would post webhook alert for ${domain}: ${payload}"
    else
        log_info "Dispatching webhook alert for ${domain}..."
        curl -s -X POST -H 'Content-type: application/json' --data "${payload}" "${WEBHOOK_URL}" > /dev/null || log_warn "Failed to send webhook alert."
    fi
}

# Main Execution Loop
json_results=()
critical_count=0

if [[ "${JSON_OUTPUT}" != "true" ]]; then
    log_info "Initiating SSL certificate expiry check (Threshold: ${WARNING_DAYS} days)..."
fi

for domain in "${TARGET_DOMAINS[@]}"; do
    # Fetch certificate expiration date via openssl s_client
    cert_end_raw=$(echo | openssl s_client -servername "${domain}" -connect "${domain}:${PORT}" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null || true)

    if [[ -z "${cert_end_raw}" ]]; then
        log_error "Unable to retrieve SSL certificate for domain: ${domain}:${PORT}"
        critical_count=$((critical_count + 1))
        if [[ "${JSON_OUTPUT}" == "true" ]]; then
            json_results+=("{\"domain\": \"${domain}\", \"status\": \"UNREACHABLE\", \"days_remaining\": -1}")
        fi
        continue
    fi

    # Extract date string (format: notAfter=May 15 12:00:00 2026 GMT)
    expiry_date_str="${cert_end_raw#notAfter=}"
    
    # Calculate epoch timestamps
    expiry_epoch=$(date -d "${expiry_date_str}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "${expiry_date_str}" +%s 2>/dev/null)
    current_epoch=$(date +%s)
    
    seconds_remaining=$((expiry_epoch - current_epoch))
    days_remaining=$((seconds_remaining / 86400))

    if [[ "${JSON_OUTPUT}" == "true" ]]; then
        json_results+=("{\"domain\": \"${domain}\", \"expiry_date\": \"${expiry_date_str}\", \"days_remaining\": ${days_remaining}, \"warning_threshold\": ${WARNING_DAYS}}")
    else
        if [[ ${days_remaining} -le ${WARNING_DAYS} ]]; then
            log_warn "Domain: ${domain} -> EXPIRES SOON! Only ${days_remaining} days left (Expires on: ${expiry_date_str})"
            send_webhook_alert "${domain}" "${days_remaining}" "${expiry_date_str}"
            critical_count=$((critical_count + 1))
        else
            log_ok "Domain: ${domain} -> Healthy. ${days_remaining} days remaining (Expires on: ${expiry_date_str})"
        fi
    fi
done

if [[ "${JSON_OUTPUT}" == "true" ]]; then
    echo "["
    ( IFS=,; echo "${json_results[*]}" )
    echo "]"
fi

# Exit with code 1 if any certificate breached the warning threshold
if [[ ${critical_count} -gt 0 ]]; then
    exit 1
fi

exit 0
