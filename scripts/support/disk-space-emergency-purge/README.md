# 🚨 Linux Emergency Disk Space Recovery

> **Target Role:** Cloud Engineer / Linux Support Engineering  
> **Technologies:** Bash, `find`, `du`, `truncate`, `journalctl`  
> **Difficulty:** Intermediate  
> **Enterprise Level:** Production-Hardened  

---

## 💥 The Real-World Incident Story & The "Ghost File" Gotcha

Your production database or web server hits **100% Disk Usage**. Services freeze, database transactions fail, and SSH logins start erroring out.

A panicked junior administrator logs into the server and runs:
```bash
rm /var/log/nginx/access.log  # (File was 50GB)
```
They check `df -h`... **and disk usage is STILL 100%!** Why?

### The Linux Kernel Gotcha (Open File Descriptors)
In Linux, running `rm` simply removes the directory entry (the "link"). However, if a running process (like NGINX, MySQL, or Java) still has that file open, the Linux kernel **refuses to release the physical disk blocks** until that process is terminated! The 50GB file becomes an invisible "ghost file".

### The Production Fix: `truncate -s 0`
Instead of deleting the file pointer, we **truncate** the file in-place:
```bash
truncate -s 0 /var/log/nginx/access.log
# OR
: > /var/log/nginx/access.log
```
This instantly zeroes out the disk blocks on the filesystem while keeping the open file descriptor intact—reclaiming all 50GB immediately with zero downtime or service restarts!

---

## 🧰 What This Script Automates

1. **Top 10 Consumer Analysis**: Runs an optimized `find + du + sort` pipeline to reveal what is eating your storage.
2. **Safe Truncation**: Finds any active `.log` files exceeding 500MB and safely truncates them to 0 bytes without crashing active daemons.
3. **Archive Purge**: Removes stale rotated `.gz` and `.1` archives older than 7 days.
4. **Systemd Journal Vacuuming**: Reduces `journalctl` logs down to a safe maximum size (e.g. 200MB).
5. **Package Cache Cleaning**: Flushes cached `.deb` or `.rpm` packages from `/var/cache/`.

---

## 📖 Usage Examples

```bash
# Safe simulation (Deletes nothing, shows what would happen)
./disk_purge.sh --dry-run

# Run on a custom directory with 14-day retention
sudo ./disk_purge.sh --target-dir /var/log/myapp --retention-days 14
```

---

## 🔍 How to Find Hidden Ghost Files Held by Dead Processes

If your disk is still full after running the script, run this command to find deleted files still held by running processes:

```bash
lsof +L1
```
Then restart only the specific process holding the deleted inode.
