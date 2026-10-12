#!/usr/bin/env bash
# ==============================================================================
# Script: disk_purge.sh
# Role: Cloud Engineer / Linux Support Engineering
# Description: Emergency triage and safe disk space recovery for Linux servers
#              experiencing critical disk exhaustion (95%+ full).
# Prerequisites: bash, find, du, truncate, journalctl (optional)
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

DRY_RUN=false
TARGET_DIR="/var/log"
MAX_JOURNAL_SIZE="200M"
RETENTION_DAYS=7

# Logging
log_info()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO]  $*"; }
log_warn()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARN]  $*"; }
log_error() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2; }

cleanup() {
    local exit_code=$?
    if [[ ${exit_code} -ne 0 ]]; then
        log_error "Emergency disk purge encountered an error (Code: ${exit_code})."
    fi
}
trap cleanup EXIT INT TERM

# Argument Parsing
while [[ $# -gt 0 ]]; do
    case "$1" in
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --target-dir)
            TARGET_DIR="$2"
            shift 2
            ;;
        -r|--retention-days)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $(basename "$0") [--dry-run] [--target-dir /var/log] [--retention-days 7]"
            exit 0
            ;;
        *)
            log_error "Unknown flag: $1"
            exit 1
            ;;
    esac
done

log_info "Initiating Emergency Disk Recovery Procedure..."
log_info "Dry-Run Mode: ${DRY_RUN}"

# Phase 1: Identify Top 10 Largest Consumers in target directory
log_info "Phase 1: Scanning for largest files in ${TARGET_DIR}..."
if [[ -d "${TARGET_DIR}" ]]; then
    echo "--- Top 10 Largest Files in ${TARGET_DIR} ---"
    find "${TARGET_DIR}" -type f -exec du -h {} + 2>/dev/null | sort -rh | head -n 10 || true
    echo "-----------------------------------------------"
fi

# Phase 2: Safely Truncate Oversized Active Log Files (> 500MB)
# Production Rule: Never 'rm' an active log file held by a running daemon; TRUNCATE it instead!
log_info "Phase 2: Checking for massive unrotated active logs (>500MB)..."
if [[ -d "${TARGET_DIR}" ]]; then
    while IFS= read -r -d '' large_file; do
        if [[ "${DRY_RUN}" == "true" ]]; then
            log_info "[DRY-RUN] Would safely truncate file to 0 bytes: ${large_file}"
        else
            log_warn "Truncating active oversized log: ${large_file}"
            truncate -s 0 "${large_file}" 2>/dev/null || : > "${large_file}"
        fi
    done < <(find "${TARGET_DIR}" -type f -name "*.log" -size +500M -print0 2>/dev/null)
fi

# Phase 3: Purge Stale Compressed Log Archives
log_info "Phase 3: Purging compressed logs (*.gz, *.1) older than ${RETENTION_DAYS} days..."
if [[ -d "${TARGET_DIR}" ]]; then
    while IFS= read -r -d '' stale_archive; do
        if [[ "${DRY_RUN}" == "true" ]]; then
            log_info "[DRY-RUN] Would remove stale archive: ${stale_archive}"
        else
            log_info "Removing archive: ${stale_archive}"
            rm -f "${stale_archive}"
        fi
    done < <(find "${TARGET_DIR}" -type f \( -name "*.gz" -o -name "*.old" -o -name "*.1" \) -mtime "+${RETENTION_DAYS}" -print0 2>/dev/null)
fi

# Phase 4: Vacuum Systemd Journal Logs (if systemd is present)
if command -v journalctl &>/dev/null; then
    log_info "Phase 4: Vacuuming systemd journals to max ${MAX_JOURNAL_SIZE}..."
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY-RUN] Would execute: journalctl --vacuum-size=${MAX_JOURNAL_SIZE}"
    else
        journalctl --vacuum-size="${MAX_JOURNAL_SIZE}" 2>/dev/null || true
    fi
fi

# Phase 5: Clean Package Manager Caches
log_info "Phase 5: Cleaning OS package manager caches..."
if command -v apt-get &>/dev/null; then
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY-RUN] Would execute: apt-get clean"
    else
        apt-get clean 2>/dev/null || true
    fi
elif command -v yum &>/dev/null; then
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY-RUN] Would execute: yum clean all"
    else
        yum clean all 2>/dev/null || true
    fi
fi

log_info "Emergency recovery procedure completed successfully."
exit 0
