export interface ScriptItem {
  id: string;
  title: string;
  role: "SRE" | "DevOps" | "Platform Ops" | "Support" | "DevRel";
  language: "Bash" | "Python" | "Kubernetes YAML" | "Multi-language";
  difficulty: "Beginner" | "Intermediate" | "Production Pro";
  summary: string;
  incidentStory: string;
  toolsExplained: { tool: string; explanation: string }[];
  dockerSandbox: string;
  path: string;
  code: string;
  tags: string[];
}

export const SCRIPTS_DATA: ScriptItem[] = [
  {
    id: "ssl-cert-expiry-checker",
    title: "SSL/TLS Certificate Expiry Checker",
    role: "SRE",
    language: "Multi-language",
    difficulty: "Intermediate",
    summary: "Monitors SSL/TLS expiration dates via TCP/SNI, warns before outage, and dispatches webhook alerts.",
    incidentStory: "At 2:15 AM on a Saturday, a wildcard TLS certificate expired on the API gateway, breaking all mobile checkout and payment webhooks. This script monitors all domain certificates daily and alerts weeks in advance.",
    toolsExplained: [
      { tool: "openssl s_client", explanation: "Establishes an interactive TLS socket connection and completes the cryptographic handshake." },
      { tool: "-servername (SNI)", explanation: "Transmits the target domain name in the TLS ClientHello so reverse proxies return the correct certificate." },
      { tool: "openssl x509", explanation: "Parses the X.509 certificate and prints the human-readable expiration date (notAfter)." },
      { tool: "curl & JSON", explanation: "Formats a structured webhook alert payload and posts it to Slack or Discord." }
    ],
    dockerSandbox: "docker run --rm alpine:3.20 /bin/sh -c 'apk add --no-cache curl openssl bash && curl -s https://raw.githubusercontent.com/iemafzalhassan/ops-script-vault/main/scripts/sre/ssl-cert-expiry-checker/cert_checker.sh | bash -s -- --warning-days 30 google.com github.com'",
    path: "scripts/sre/ssl-cert-expiry-checker/cert_checker.sh",
    code: `#!/usr/bin/env bash
# Role: Site Reliability Engineering (SRE)
set -euo pipefail
IFS=$'\\n\\t'

WARNING_DAYS=14
TARGET_DOMAINS=("google.com" "github.com")

for domain in "\${TARGET_DOMAINS[@]}"; do
    cert_end=$(echo | openssl s_client -servername "\${domain}" -connect "\${domain}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null || true)
    expiry_date_str="\${cert_end#notAfter=}"
    expiry_epoch=$(date -d "\${expiry_date_str}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "\${expiry_date_str}" +%s 2>/dev/null)
    days_left=$(( (expiry_epoch - $(date +%s)) / 86400 ))
    
    if [[ \${days_left} -le \${WARNING_DAYS} ]]; then
        echo "🚨 WARN: \${domain} expires in \${days_left} days (\${expiry_date_str})"
    else
        echo "✅ OK: \${domain} healthy (\${days_left} days remaining)"
    fi
done`,
    tags: ["SSL", "Security", "SRE", "Networking", "OpenSSL", "Alerting"]
  },
  {
    id: "k8s-cronjob-log-cleaner",
    title: "Kubernetes PV Log Pruner & Compressor",
    role: "Platform Ops",
    language: "Kubernetes YAML",
    difficulty: "Intermediate",
    summary: "Production batch/v1 CronJob spec that automatically gzips uncompressed logs and prunes stale volumes.",
    incidentStory: "Legacy microservices wrote raw logs to attached PersistentVolumeClaims until nodes threw NodeHasDiskPressure and began evicting mission-critical pods. This automated CronJob keeps PVC disk and inode usage under control.",
    toolsExplained: [
      { tool: "batch/v1 CronJob", explanation: "Kubernetes native controller that runs containerized jobs on a recurring cron schedule." },
      { tool: "concurrencyPolicy: Forbid", explanation: "Prevents duplicate jobs from running simultaneously if a previous backup is still executing." },
      { tool: "securityContext (non-root)", explanation: "Locks down container privileges to UID 10001 with readOnlyRootFilesystem for enterprise hardening." }
    ],
    dockerSandbox: "docker run --rm busybox /bin/sh -c 'echo \"Simulating K8s log cleaner...\"; find /tmp -type f -name \"*.log\"'",
    path: "scripts/platform-ops/k8s-cronjob-log-cleaner/cronjob.yaml",
    code: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: persistent-volume-log-cleaner
  namespace: production
spec:
  schedule: "0 2 * * *"
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: log-cleaner
              image: busybox:1.36
              command:
                - /bin/sh
                - -c
                - |
                  find /mnt/data/logs -type f -name "*.gz" -mtime +7 -exec rm -f {} +
                  find /mnt/data/logs -type f -name "*.log" -mtime +1 -exec gzip -f {} +
              resources:
                requests:
                  cpu: "50m"
                  memory: "64Mi"
              volumeMounts:
                - name: app-log-storage
                  mountPath: /mnt/data/logs
          volumes:
            - name: app-log-storage
              persistentVolumeClaim:
                claimName: shared-app-logs-pvc`,
    tags: ["Kubernetes", "CronJob", "Platform Ops", "PVC", "Storage", "Containers"]
  },
  {
    id: "docker-system-prune-safe",
    title: "Safe Docker System Pruner",
    role: "DevOps",
    language: "Bash",
    difficulty: "Intermediate",
    summary: "Prunes dangling Docker layers, containers, and build cache only when disk usage exceeds safety threshold.",
    incidentStory: "A developer ran 'docker system prune -a --volumes' on a shared CI runner, which wiped out local DB test volumes and un-cached 40GB of base images. This script only prunes dangling assets when disk space actually breaches 80%.",
    toolsExplained: [
      { tool: "docker info --format", explanation: "Dynamically inspects the Docker daemon to find the actual storage mount root (/var/lib/docker)." },
      { tool: "df & awk", explanation: "Calculates live disk consumption percentage for threshold comparison." },
      { tool: "--filter until=24h", explanation: "Guarantees recent deployment artifacts and active rollback candidates are never deleted." }
    ],
    dockerSandbox: "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock docker:cli sh -c 'docker system df'",
    path: "scripts/devops/docker-system-prune-safe/safe_prune.sh",
    code: `#!/usr/bin/env bash
# Role: DevOps Engineer / CI/CD
set -euo pipefail
IFS=$'\\n\\t'

THRESHOLD_PERCENT=75
IMAGE_AGE_HOURS=24
DOCKER_ROOT=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo "/var/lib/docker")
USAGE=$(df -P "\${DOCKER_ROOT}" | awk 'NR==2 {gsub(/%/, ""); print $5}')

if [[ \${USAGE} -ge \${THRESHOLD_PERCENT} ]]; then
    echo "⚠️ Disk usage (\${USAGE}%) exceeds threshold (\${THRESHOLD_PERCENT}%). Pruning..."
    docker container prune -f --filter "until=\${IMAGE_AGE_HOURS}h"
    docker image prune -f --filter "dangling=true"
    docker builder prune -f --filter "until=\${IMAGE_AGE_HOURS}h"
else
    echo "✅ Disk usage (\${USAGE}%) is healthy. Pruning skipped."
fi`,
    tags: ["Docker", "DevOps", "CI/CD", "Disk", "Cleanup", "Containers"]
  },
  {
    id: "disk-space-emergency-purge",
    title: "Linux Emergency Disk Recovery",
    role: "Support",
    language: "Bash",
    difficulty: "Intermediate",
    summary: "Recovers 100% full Linux disks by safely truncating unrotated logs and vacuuming systemd journals.",
    incidentStory: "A junior admin ran 'rm big.log' on a 40GB file, but 'df -h' still showed 100% full because NGINX held the open file descriptor! Truncating with ': > file' zeroes the blocks immediately without restarting the service.",
    toolsExplained: [
      { tool: "truncate -s 0", explanation: "Zeroes out a file's disk blocks without deleting the inode pointer held by active background processes." },
      { tool: "journalctl --vacuum-size", explanation: "Safely trims systemd journal logs to a designated quota (e.g. 200M) without corrupting log index." },
      { tool: "apt-get clean / yum clean", explanation: "Flushes accumulated deb/rpm package installer archives from OS cache." }
    ],
    dockerSandbox: "docker run --rm ubuntu:22.04 /bin/sh -c 'echo \"Testing disk recovery analysis...\"; du -sh /var/log'",
    path: "scripts/support/disk-space-emergency-purge/disk_purge.sh",
    code: `#!/usr/bin/env bash
# Role: Linux Support / Cloud Engineer
set -euo pipefail

TARGET_DIR="/var/log"
echo "=== Top 10 Largest Files in \${TARGET_DIR} ==="
find "\${TARGET_DIR}" -type f -exec du -h {} + 2>/dev/null | sort -rh | head -n 10

# Safely truncate active oversized logs (>500MB) without breaking daemons
find "\${TARGET_DIR}" -type f -name "*.log" -size +500M -exec truncate -s 0 {} +

# Vacuum systemd journal to max 200MB
if command -v journalctl &>/dev/null; then
    journalctl --vacuum-size=200M || true
fi`,
    tags: ["Linux", "Storage", "Support", "SysAdmin", "Emergency", "Troubleshooting"]
  },
  {
    id: "developer-env-doctor",
    title: "Workstation Doctor & Environment Auditor",
    role: "DevRel",
    language: "Bash",
    difficulty: "Beginner",
    summary: "Interactive colored terminal audit that checks developer tools, Git config, RAM, and prints exact install commands.",
    incidentStory: "New contributors and team members spent days battling broken local setups ('Works on my machine!'). This single-command auditor validates their workstation in 3 seconds and gives them the exact commands to fix missing dependencies.",
    toolsExplained: [
      { tool: "command -v", explanation: "POSIX standard shell built-in to check whether a program exists in the user PATH." },
      { tool: "uname -s & uname -m", explanation: "Detects OS kernel (Darwin vs Linux) and architecture (arm64 vs x86_64) for OS-specific commands." },
      { tool: "git config --get", explanation: "Verifies user.name and user.email to prevent accidental uncredited commits." }
    ],
    dockerSandbox: "docker run --rm alpine:3.20 /bin/sh -c 'apk add --no-cache bash curl git && curl -s https://raw.githubusercontent.com/iemafzalhassan/ops-script-vault/main/scripts/devrel/developer-env-doctor/doctor.sh | bash'",
    path: "scripts/devrel/developer-env-doctor/doctor.sh",
    code: `#!/usr/bin/env bash
# Role: DevRel / Developer Experience
set -euo pipefail

echo "🩺 Auditing Developer Workstation..."

check() {
    local tool="$1"
    local cmd="$2"
    if command -v "$tool" &>/dev/null; then
        echo "✅ FOUND: $tool ($($tool $cmd | head -n 1))"
    else
        echo "❌ MISSING: $tool"
    fi
}

check "git" "--version"
check "python3" "--version"
check "node" "-v"
check "docker" "--version"
check "kubectl" "version --client"`,
    tags: ["DevRel", "Onboarding", "Productivity", "Beginner", "Developer Experience"]
  }
];
