# Track 2: Production Hardening Rules (The "Bulletproof Script" Standard)

A script written for your laptop is very different from a script running on an AWS EC2 instance, a bare-metal Kubernetes node, or a 3:00 AM enterprise cronjob.

If a script fails on your laptop, you see an error and hit `Ctrl+C`.  
If a script fails silently in production, it might delete the wrong database volume or leave an unfinished lock file that blocks production deployments.

Here is the exact playbook used by top Site Reliability Engineers to harden scripts against disaster.

---

## 1. The Golden Line: `set -euo pipefail`

At the top of every production Bash script, you must include:

```bash
set -euo pipefail
IFS=$'\n\t'
```

### What does each flag do?

1. **`-e` (Exit on error)**:
   - By default, Bash will keep running subsequent lines even if an earlier line failed!
   - Imagine line 1 is `cd /tmp/backups` (which fails because the directory does not exist), and line 2 is `rm -rf *`. Without `-e`, your script will stay in `/` and delete everything on your system!
   - `-e` forces the script to abort immediately if any command returns a non-zero exit code.

2. **`-u` (No unset variables)**:
   - If you mistype a variable name (e.g., `${BACKUP_DIR}` vs `${BAKUP_DIR}`), Bash normally treats the missing variable as an empty string `""` without telling you.
   - `-u` throws a fatal error if you ever reference an uninitialized variable.

3. **`-o pipefail` (Capture piped errors)**:
   - In a pipe like `cat missing_file.txt | grep "error"`, by default Bash only checks the exit code of the *last* command (`grep`). If `grep` succeeds or exits cleanly, Bash reports success even though `cat` failed!
   - `pipefail` ensures that if ANY command in the pipeline fails, the whole pipeline fails.

4. **`IFS=$'\n\t'` (Safe Internal Field Separator)**:
   - Prevents Bash from splitting strings on spaces. Crucial when looping over file names that have spaces in them.

---

## 2. Safe Traps: Automated Cleanup on Exit

What happens if an engineer cancels your script with `Ctrl+C`, or the server suddenly runs out of memory?

Using `trap`, you register a cleanup function that is guaranteed to run whenever the script finishes or encounters an error:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Create a secure temporary directory
TEMP_DIR=$(mktemp -d /tmp/ops-task.XXXXXX)

cleanup() {
    local exit_code=$?
    echo "[CLEANUP] Removing temporary directory: ${TEMP_DIR}..."
    rm -rf "${TEMP_DIR}"
    if [[ ${exit_code} -ne 0 ]]; then
        echo -e "\033[0;31m[FAILURE] Script failed with status ${exit_code}\033[0m" >&2
    fi
}
# Trap normal exit (EXIT), errors (ERR), and termination signals (INT, TERM)
trap cleanup EXIT ERR INT TERM
```

---

## 3. The `--dry-run` Safety Switch

Any script that performs destructive operations (deleting logs, terminating pods, purging database records, pruning Docker images) **must** support a dry-run flag.

```bash
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

execute() {
    local cmd="$*"
    if [[ "${DRY_RUN}" == "true" ]]; then
        echo "[DRY-RUN] Would execute: ${cmd}"
    else
        echo "[EXEC] Running: ${cmd}"
        eval "${cmd}"
    fi
}

# Example usage:
execute "rm -rf /var/log/app/old-*.log"
```

---

## 4. Idempotence: Run it 100 Times with Zero Side Effects

A script is **idempotent** if running it once produces the exact same result as running it 100 times in a row without crashing or duplicating data.

- **Non-Idempotent**: `mkdir /data/logs` (Crashes on the second run with `File exists`).
- **Idempotent**: `mkdir -p /data/logs` (Creates if missing, does nothing if already there).
- **Non-Idempotent**: `echo "export PATH=$PATH:/opt/bin" >> ~/.bashrc` (Appends 100 duplicate lines if run 100 times!).
- **Idempotent**: Checking if the line already exists with `grep -qF` before appending.

---

## 5. Structured Production Logging

Don't just print raw text. Use standardized timestamps and log levels:

```bash
log_info()  { echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] \033[0;32m[INFO]\033[0m  $*"; }
log_warn()  { echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] \033[0;33m[WARN]\033[0m  $*"; }
log_error() { echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] \033[0;31m[ERROR]\033[0m $*" >&2; }
```
