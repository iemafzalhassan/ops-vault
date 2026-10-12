#!/usr/bin/env bash
# ==============================================================================
# Script: safe_prune.sh
# Role: DevOps Engineer / CI/CD Pipeline Maintenance
# Description: Safely prunes dangling Docker images, stopped containers, and
#              abandoned build caches only when disk thresholds are exceeded.
# Prerequisites: docker CLI, awk, df
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# Defaults
THRESHOLD_PERCENT=75
IMAGE_AGE_HOURS=24
DRY_RUN=false
FORCE=false

# Logger
log_info()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO]  $*"; }
log_warn()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARN]  $*"; }
log_error() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2; }

cleanup() {
    local exit_code=$?
    if [[ ${exit_code} -ne 0 ]]; then
        log_error "Docker pruning process exited unexpectedly."
    fi
}
trap cleanup EXIT INT TERM

# Argument Parsing
while [[ $# -gt 0 ]]; do
    case "$1" in
        -t|--threshold)
            THRESHOLD_PERCENT="$2"
            shift 2
            ;;
        -a|--age-hours)
            IMAGE_AGE_HOURS="$2"
            shift 2
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $(basename "$0") [--threshold 75] [--age-hours 24] [--dry-run] [--force]"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Step 1: Verify Docker Daemon Connectivity
if ! command -v docker &>/dev/null; then
    log_error "Docker CLI is not installed or not in PATH!"
    exit 1
fi

if ! docker info &>/dev/null; then
    log_warn "Docker daemon is unreachable or current user lacks docker group permissions."
    exit 0
fi

# Step 2: Determine Docker Root Storage Disk Usage
DOCKER_ROOT=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo "/var/lib/docker")
CURRENT_USAGE=$(df -P "${DOCKER_ROOT}" 2>/dev/null | awk 'NR==2 {gsub(/%/, ""); print $5}' || echo "0")

log_info "Docker Root Dir: ${DOCKER_ROOT} (Current Disk Usage: ${CURRENT_USAGE}%)"
log_info "Configured Threshold: ${THRESHOLD_PERCENT}%"

if [[ ${CURRENT_USAGE} -lt ${THRESHOLD_PERCENT} ]] && [[ "${FORCE}" != "true" ]]; then
    log_info "Disk usage (${CURRENT_USAGE}%) is below threshold (${THRESHOLD_PERCENT}%). Pruning skipped."
    exit 0
fi

log_warn "Disk usage (${CURRENT_USAGE}%) exceeds or equals threshold (${THRESHOLD_PERCENT}%). Initiating safe prune..."

# Step 3: Prune Stopped Containers
log_info "Cleaning stopped containers older than ${IMAGE_AGE_HOURS}h..."
if [[ "${DRY_RUN}" == "true" ]]; then
    log_info "[DRY-RUN] Would run: docker container prune -f --filter 'until=${IMAGE_AGE_HOURS}h'"
else
    docker container prune -f --filter "until=${IMAGE_AGE_HOURS}h"
fi

# Step 4: Prune Dangling Images (Untagged <none>)
log_info "Pruning dangling images..."
if [[ "${DRY_RUN}" == "true" ]]; then
    log_info "[DRY-RUN] Would run: docker image prune -f --filter 'dangling=true'"
else
    docker image prune -f --filter "dangling=true"
fi

# Step 5: Prune Stale Buildx Cache
log_info "Pruning build cache older than ${IMAGE_AGE_HOURS}h..."
if [[ "${DRY_RUN}" == "true" ]]; then
    log_info "[DRY-RUN] Would run: docker builder prune -f --filter 'until=${IMAGE_AGE_HOURS}h'"
else
    docker builder prune -f --filter "until=${IMAGE_AGE_HOURS}h"
fi

# Final Disk Check
NEW_USAGE=$(df -P "${DOCKER_ROOT}" 2>/dev/null | awk 'NR==2 {gsub(/%/, ""); print $5}' || echo "0")
log_info "Prune complete. Disk usage changed from ${CURRENT_USAGE}% to ${NEW_USAGE}%."
exit 0
