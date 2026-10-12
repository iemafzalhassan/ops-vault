#!/usr/bin/env bash
# ==============================================================================
# Script: cleanup.sh
# Role: Platform Operations / Kubernetes Engineering
# Description: Automated log compression and retention pruner for container volumes.
#              Compresses uncompressed logs and purges logs exceeding retention limit.
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# Defaults
DEFAULT_LOG_DIR="/var/log/app"
LOG_DIR="${DEFAULT_LOG_DIR}"
RETENTION_DAYS=7
COMPRESS_DAYS=1
DRY_RUN=false

# Logger
log_info()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO]  $*"; }
log_warn()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARN]  $*"; }
log_error() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2; }

cleanup() {
    local exit_code=$?
    if [[ ${exit_code} -ne 0 ]]; then
        log_error "Log cleanup job encountered an unexpected error (Exit Code: ${exit_code})."
    fi
}
trap cleanup EXIT INT TERM

# CLI Options
while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--dir)
            LOG_DIR="$2"
            shift 2
            ;;
        -r|--retention-days)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -c|--compress-days)
            COMPRESS_DAYS="$2"
            shift 2
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "Usage: $(basename "$0") [--dir /path] [--retention-days 7] [--compress-days 1] [--dry-run]"
            exit 0
            ;;
        *)
            log_error "Unknown parameter: $1"
            exit 1
            ;;
    esac
done

if [[ ! -d "${LOG_DIR}" ]]; then
    log_warn "Target directory '${LOG_DIR}' does not exist! Nothing to clean."
    exit 0
fi

log_info "Starting log maintenance on: ${LOG_DIR}"
log_info "Compressing files older than ${COMPRESS_DAYS} days; Purging files older than ${RETENTION_DAYS} days."

# 1. Compress raw .log files older than COMPRESS_DAYS
log_info "Step 1: Finding and compressing historical logs (*.log)..."
while IFS= read -r -d '' logfile; do
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY-RUN] Would gzip: ${logfile}"
    else
        log_info "Compressing: ${logfile}"
        gzip -f "${logfile}"
    fi
done < <(find "${LOG_DIR}" -type f -name "*.log" -mtime "+${COMPRESS_DAYS}" -print0)

# 2. Delete compressed .gz files older than RETENTION_DAYS
log_info "Step 2: Purging compressed archives exceeding retention (*.gz)..."
deleted_count=0
while IFS= read -r -d '' archive; do
    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY-RUN] Would delete: ${archive}"
    else
        log_info "Deleting: ${archive}"
        rm -f "${archive}"
    fi
    deleted_count=$((deleted_count + 1))
done < <(find "${LOG_DIR}" -type f -name "*.gz" -mtime "+${RETENTION_DAYS}" -print0)

log_info "Maintenance complete. Purged ${deleted_count} stale log archives."
exit 0
