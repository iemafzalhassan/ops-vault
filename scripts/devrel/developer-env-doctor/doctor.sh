#!/usr/bin/env bash
# ==============================================================================
# Script: doctor.sh
# Role: DevRel / Developer Experience / Student Onboarding
# Description: Automated development workstation health check. Validates core
#              tools, runtimes, memory, and prints exact commands to fix missing tools.
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# ANSI Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
MISSING_TOOLS=()

print_header() {
    cat << "EOF"
  ___             _   _             _   _ 
 / _ \ _ __  ___ | | | | ___   __ _| |_| |__  
| | | | '_ \/ __|| | | |/ _ \ / _` | __| '_ \ 
| |_| | |_) \__ \| |_| | (_) | (_| | |_| | | |
 \___/| .__/|___(_)___/ \___/ \__,_|\__|_| |_|
      |_|                                     
   Developer Environment Doctor & Health Check
===================================================
EOF
}

detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ -f /etc/os-release ]]; then
        # shellcheck disable=SC1091
        source /etc/os-release
        echo "${ID:-linux}"
    else
        echo "linux"
    fi
}

OS=$(detect_os)

check_tool() {
    local name="$1"
    local command_name="$2"
    local version_arg="$3"
    local install_cmd="$4"

    echo -n "Checking ${name}... "
    if command -v "${command_name}" &>/dev/null; then
        local version_output
        version_output=$(eval "${command_name} ${version_arg}" 2>&1 | head -n 1 || true)
        echo -e "${GREEN}✔ FOUND${NC} (${version_output})"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "${RED}✘ MISSING${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        MISSING_TOOLS+=("${name} -> ${install_cmd}")
    fi
}

check_system_resources() {
    echo -e "\n${BOLD}[1/3] System Architecture & Resources${NC}"
    echo "OS / Platform: $(uname -s) ($(uname -m))"

    # Disk Space Check
    local free_disk_gb
    free_disk_gb=$(df -k . | awk 'NR==2 {print int($4 / 1024 / 1024)}')
    if [[ ${free_disk_gb} -ge 10 ]]; then
        echo -e "Available Disk Space: ${GREEN}✔ ${free_disk_gb} GB${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "Available Disk Space: ${YELLOW}⚠ Low (${free_disk_gb} GB free)${NC}"
        WARN_COUNT=$((WARN_COUNT + 1))
    fi
}

check_git_identity() {
    echo -e "\n${BOLD}[2/3] Git Identity & SSH Configuration${NC}"
    
    local git_user git_email
    git_user=$(git config --get user.name || echo "")
    git_email=$(git config --get user.email || echo "")

    if [[ -n "${git_user}" ]]; then
        echo -e "Git user.name:  ${GREEN}✔ ${git_user}${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "Git user.name:  ${YELLOW}⚠ Not Configured (Run: git config --global user.name 'Your Name')${NC}"
        WARN_COUNT=$((WARN_COUNT + 1))
    fi

    if [[ -n "${git_email}" ]]; then
        echo -e "Git user.email: ${GREEN}✔ ${git_email}${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "Git user.email: ${YELLOW}⚠ Not Configured (Run: git config --global user.email 'you@domain.com')${NC}"
        WARN_COUNT=$((WARN_COUNT + 1))
    fi
}

check_core_runtimes() {
    echo -e "\n${BOLD}[3/3] Developer Runtimes & Infrastructure Tools${NC}"
    
    case "${OS}" in
        macos)
            check_tool "Git"      "git"      "--version" "brew install git"
            check_tool "Python 3" "python3"  "--version" "brew install python"
            check_tool "Node.js"  "node"     "-v"        "brew install node"
            check_tool "Docker"   "docker"   "--version" "brew install --cask docker"
            check_tool "Kubectl"  "kubectl"  "version --client --output=yaml" "brew install kubectl"
            ;;
        ubuntu|debian)
            check_tool "Git"      "git"      "--version" "sudo apt update && sudo apt install -y git"
            check_tool "Python 3" "python3"  "--version" "sudo apt update && sudo apt install -y python3"
            check_tool "Node.js"  "node"     "-v"        "sudo apt install -y nodejs npm"
            check_tool "Docker"   "docker"   "--version" "curl -fsSL https://get.docker.com | sh"
            check_tool "Kubectl"  "kubectl"  "version --client" "snap install kubectl --classic"
            ;;
        arch|omarchy)
            check_tool "Git"      "git"      "--version" "sudo pacman -S git"
            check_tool "Python 3" "python3"  "--version" "sudo pacman -S python"
            check_tool "Node.js"  "node"     "-v"        "sudo pacman -S nodejs npm"
            check_tool "Docker"   "docker"   "--version" "sudo pacman -S docker"
            check_tool "Kubectl"  "kubectl"  "version --client" "sudo pacman -S kubectl"
            ;;
        *)
            check_tool "Git"      "git"      "--version" "Install Git from https://git-scm.com"
            check_tool "Python 3" "python3"  "--version" "Install Python 3 from https://python.org"
            check_tool "Node.js"  "node"     "-v"        "Install Node.js from https://nodejs.org"
            check_tool "Docker"   "docker"   "--version" "Install Docker from https://docker.com"
            check_tool "Kubectl"  "kubectl"  "version --client" "Install Kubectl from https://kubernetes.io/docs/tasks/tools/"
            ;;
    esac
}

main() {
    print_header
    check_system_resources
    check_git_identity
    check_core_runtimes

    echo -e "\n==================================================="
    echo -e "Summary: ${GREEN}${PASS_COUNT} Passed${NC} | ${YELLOW}${WARN_COUNT} Warnings${NC} | ${RED}${FAIL_COUNT} Failed${NC}"
    
    if [[ ${FAIL_COUNT} -gt 0 ]]; then
        echo -e "\n${BOLD}${RED}Suggested Commands to Fix Missing Tools:${NC}"
        for fix in "${MISSING_TOOLS[@]}"; do
            echo -e "  • ${fix}"
        done
        echo ""
        exit 1
    else
        echo -e "\n${GREEN}${BOLD}🎉 Awesome! Your workstation is fully configured and production-ready!${NC}\n"
        exit 0
    fi
}

main "$@"
