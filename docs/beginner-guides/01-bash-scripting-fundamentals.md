# Track 1: Bash & Shell Scripting Fundamentals for Non-IT Learners

Welcome! If you come from a non-technical background, a helpdesk role, or are just starting out with coding, terminal scripting can look like magical hieroglyphics. 

This guide strips away the jargon and explains how shell scripting actually works from the ground up.

---

## 1. What is a Shell Script?

When you type a command in your terminal like `ls` or `mkdir my_folder`, you are giving the operating system **one command at a time**.

A **shell script** is simply a plain text file containing a list of those commands in order. The computer executes them one after another, automatically—saving you hours of repetitive typing and human error.

---

## 2. Line 1: The "Shebang" (`#!/usr/bin/env bash`)

Every shell script begins with a special line called the **shebang**:

```bash
#!/usr/bin/env bash
```

### Why does this exist?
- When you run a script, your Linux or macOS system needs to know which program should read and execute the instructions.
- `#` is normally a comment, but when followed immediately by `!`, the operating system treats it as an executable interpreter directive.
- Using `/usr/bin/env bash` is a production best practice because it dynamically locates the `bash` executable regardless of whether you are on Ubuntu, Debian, Red Hat, Alpine, or macOS.

---

## 3. The 3 Data Streams: STDIN, STDOUT, and STDERR

Every program in Linux automatically has 3 streams connected to it:

| Stream Name | File Descriptor | Plain English Meaning | Default Destination |
| :--- | :--- | :--- | :--- |
| **STDIN** | `0` | Standard Input (what goes into the program) | Your Keyboard |
| **STDOUT** | `1` | Standard Output (normal output/data) | Your Screen / Terminal |
| **STDERR** | `2` | Standard Error (error messages & warnings) | Your Screen / Terminal |

### Redirection Operators:
- `>`: Overwrite a file with STDOUT (`echo "hello" > file.txt`).
- `>>`: Append STDOUT to the end of a file (`echo "world" >> file.txt`).
- `2>`: Redirect only errors (`ls /nonexistent 2> error.log`).
- `&>` or `2>&1`: Combine both normal output and errors into one file.
- `|` (The Pipe): Take the STDOUT of the left program and feed it directly as the STDIN of the right program!

```bash
# Example: Find all running python processes and count them
ps aux | grep "python" | wc -l
```

---

## 4. Variables & Quoting Rules

In Bash, setting a variable must have **no spaces** around the `=` sign:

```bash
# Correct:
APP_NAME="billing-service"
PORT=8080

# Wrong (will produce a syntax error!):
APP_NAME = "billing-service"
```

### Double Quotes vs Single Quotes:
- Double Quotes (`"..."`): Allows variables to expand.
  ```bash
  echo "Deploying ${APP_NAME} on port ${PORT}"
  # Output: Deploying billing-service on port 8080
  ```
- Single Quotes (`'...'`): Treats everything literally as raw text.
  ```bash
  echo 'Deploying ${APP_NAME}'
  # Output: Deploying ${APP_NAME}
  ```

---

## 5. Exit Codes: How Production Systems Know if Code Failed

Every single Linux command returns a hidden number between `0` and `255` when it finishes:
- `0` means **Success** (no error).
- Any number **1 through 255** means **Failure** or error.

You can inspect the exit code of the last run command with `$?`:

```bash
mkdir /test-directory
echo "Exit code was: $?" # Prints 0 if successful
```

In production, CI/CD pipelines (like GitHub Actions or Jenkins) and Kubernetes check this exit code. If your script exits with `0`, the deployment passes. If it exits with `1`, the deployment stops!

---

## 6. Loops and Conditionals: Real Example

Here is a real example: check if a list of microservices are responding over HTTP:

```bash
#!/usr/bin/env bash

SERVICES=("auth" "billing" "notifications")

for service in "${SERVICES[@]}"; do
    echo "Checking health for: ${service}..."
    
    # -s: silent, -f: fail on 4xx/5xx HTTP codes
    if curl -s -f "http://localhost:8080/health/${service}" > /dev/null; then
        echo "✅ ${service} is HEALTHY"
    else
        echo "❌ ${service} is DOWN! Alerting team..."
    fi
done
```

---

## 7. Next Steps

Now that you understand shebangs, variables, streams, and exit codes, proceed to:
👉 **[Track 2: Production Hardening Rules](./02-production-hardening-rules.md)** to learn how enterprise engineers make scripts bulletproof against crashes!
