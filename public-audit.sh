#!/usr/bin/env bash

set -u

PASS=0
WARN=0
FAIL=0

REPORT="${REPORT:-public-audit-report.txt}"
REPORT_BASENAME=$(basename "$REPORT")
TEMP_DIRECTORY=$(mktemp -d 2>/dev/null || mktemp -d -t kata-ui-public-audit)
trap 'rm -rf "$TEMP_DIRECTORY"' EXIT

echo "Public Repository Audit" > "$REPORT"
echo "=======================" >> "$REPORT"

pass() {
    echo "[PASS] $1"
    echo "[PASS] $1" >> "$REPORT"
    PASS=$((PASS+1))
}

warn() {
    echo "[WARN] $1"
    echo "[WARN] $1" >> "$REPORT"
    WARN=$((WARN+1))
}

fail() {
    echo "[FAIL] $1"
    echo "[FAIL] $1" >> "$REPORT"
    FAIL=$((FAIL+1))
}

info() {
    echo "[INFO] $1"
    echo "[INFO] $1" >> "$REPORT"
}

section() {
    echo ""
    echo "## $1"
    echo "" >> "$REPORT"
    echo "## $1" >> "$REPORT"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

section "Environment"

if command_exists git; then
    pass "git available"
else
    fail "git command not found"
fi

if command_exists node; then
    pass "node available"
else
    warn "node not installed"
fi

if command_exists npm; then
    pass "npm available"
else
    warn "npm not installed"
fi

if command_exists gitleaks; then
    pass "gitleaks available"
else
    warn "gitleaks not installed"
fi

section "Secret Scan"

if command_exists gitleaks; then
    if gitleaks dir . >"$TEMP_DIRECTORY/gitleaks-current.log" 2>&1; then
        pass "current files secret scan"
    else
        fail "secret detected in current files"
        cat "$TEMP_DIRECTORY/gitleaks-current.log" >> "$REPORT"
    fi

    if gitleaks git --log-opts="--all" . >"$TEMP_DIRECTORY/gitleaks-history.log" 2>&1; then
        pass "git history secret scan"
    else
        fail "secret detected in git history"
        cat "$TEMP_DIRECTORY/gitleaks-history.log" >> "$REPORT"
    fi
else
    info "gitleaks unavailable; current files and git history scans skipped"
fi

section "Suspicious Files"

DANGEROUS_FILES=(
    ".env"
    ".env.local"
    "credentials.json"
    "service-account.json"
    "*.pem"
    "*.key"
    "*.pfx"
    "*.p12"
    "*.bak"
    "*.dump"
)

dangerous_files_found=false
for pattern in "${DANGEROUS_FILES[@]}"; do
    result=$(find . \
        -path "./.git" -prune -o \
        -path "./node_modules" -prune -o \
        -name "$pattern" -print \
        2>/dev/null)

    if [ -n "$result" ]; then
        dangerous_files_found=true
        fail "dangerous file found: $pattern"
        echo "$result" >> "$REPORT"
    fi
done

if [ "$dangerous_files_found" = false ]; then
    pass "no dangerous files"
fi

section "Secret-like Values"

SECRET_PATTERNS=(
    "password[ ]*="
    "secret[ ]*="
    "token[ ]*="
    "apikey[ ]*="
    "api_key[ ]*="
    "connectionstring[ ]*="
    "privatekey[ ]*="
)

secret_like_values_found=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    result=$(grep -RniE "$pattern" \
        --exclude-dir=.git \
        --exclude-dir=node_modules \
        --exclude-dir=bin \
        --exclude-dir=obj \
        --exclude="$REPORT_BASENAME" \
        . 2>/dev/null || true)

    if [ -n "$result" ]; then
        secret_like_values_found=true
        warn "possible secret pattern: $pattern"
        echo "$result" >> "$REPORT"
    fi
done

if [ "$secret_like_values_found" = false ]; then
    pass "no common secret-like values"
fi

section "Repository"

if [ -f README.md ]; then
    pass "README.md exists"
else
    fail "README.md missing"
fi

if [ -f LICENSE ]; then
    pass "LICENSE exists"
else
    fail "LICENSE missing"
fi

ARCHITECTURE_DOCUMENTS=(
    "docs/architecture.md"
    "docs/components.md"
    "docs/theming.md"
)

for document in "${ARCHITECTURE_DOCUMENTS[@]}"; do
    if [ -f "$document" ]; then
        pass "$document exists"
    else
        fail "$document missing"
    fi
done

BAD_FILES=$(find . \
    -path "./.git" -prune -o \
    -path "./node_modules" -prune -o \
    \( -name "*.user" \
    -o -name "*.suo" \
    -o -name "*.tmp" \
    -o -name "*.log" \
    -o -name ".DS_Store" \
    \) \
    -print)

if [ -z "$BAD_FILES" ]; then
    pass "no common temporary files"
else
    warn "temporary files found"
    echo "$BAD_FILES" >> "$REPORT"
fi

section "Documentation"

DOCUMENTATION_RULES=(
    "Installation|インストール|導入|まず試す"
    "Usage|利用例|使い方|最小構成"
    "License|ライセンス"
)

if [ -f README.md ]; then
    for rule in "${DOCUMENTATION_RULES[@]}"; do
        IFS="|" read -r -a keywords <<< "$rule"
        found=false

        for keyword in "${keywords[@]}"; do
            if grep -qiF "$keyword" README.md; then
                found=true
                break
            fi
        done

        if [ "$found" = true ]; then
            pass "README contains ${keywords[0]} guidance"
        else
            warn "README missing ${keywords[0]} guidance"
        fi
    done
fi

section "Node Project"

if [ -f package.json ]; then
    pass "package.json exists"

    package_json_valid=false
    if command_exists node && node -e 'JSON.parse(require("node:fs").readFileSync("package.json", "utf8"))' >/dev/null 2>&1; then
        package_json_valid=true
        pass "package.json is valid JSON"
    else
        fail "package.json is invalid or node is unavailable"
    fi

    if [ "$package_json_valid" = true ]; then
        if node -e 'const p=require("./package.json"); process.exit(typeof p.name === "string" && p.name.length > 0 ? 0 : 1)'; then
            pass "package name"
        else
            fail "package name missing"
        fi

        if node -e 'const p=require("./package.json"); process.exit(typeof p.version === "string" && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(p.version) ? 0 : 1)'; then
            pass "package version"
        else
            fail "package version missing or invalid"
        fi

        if node -e 'const p=require("./package.json"); process.exit(typeof p.license === "string" && p.license.length > 0 ? 0 : 1)'; then
            pass "package license"
        else
            fail "package license missing"
        fi

        if node -e 'const p=require("./package.json"); process.exit(typeof p.scripts?.check === "string" && p.scripts.check.length > 0 ? 0 : 1)'; then
            pass "package scripts.check"
        else
            fail "package scripts.check missing"
        fi
    fi
else
    info "package.json not found; Node.js audit skipped"
fi

section "Component Contract"

shopt -s nullglob
component_directories=(src/components/kata-*)
shopt -u nullglob

if [ "${#component_directories[@]}" -eq 0 ]; then
    info "no kata-* component directories found"
else
    for directory in "${component_directories[@]}"; do
        component=$(basename "$directory")
        component_contract_valid=true

        for suffix in ".spec.md" ".html" ".js" ".css" ".test.js"; do
            if [ ! -f "$directory/$component$suffix" ]; then
                component_contract_valid=false
                fail "$component missing $component$suffix"
            fi
        done

        if [ "$component_contract_valid" = true ]; then
            pass "$component component contract"
        fi

        if [ -d "$directory/examples" ]; then
            pass "$component examples"
        else
            warn "$component examples missing"
        fi
    done
fi

section "Build"

if [ -f package.json ]; then
    if ! command_exists npm; then
        fail "npm unavailable for Node.js build"
    elif [ ! -f package-lock.json ]; then
        fail "package-lock.json missing; npm ci unavailable"
    else
        if npm ci >"$TEMP_DIRECTORY/npm-ci.log" 2>&1; then
            pass "npm ci"
        else
            fail "npm ci failed"
            cat "$TEMP_DIRECTORY/npm-ci.log" >> "$REPORT"
        fi

        if npm run check >"$TEMP_DIRECTORY/npm-check.log" 2>&1; then
            pass "npm run check"
        else
            fail "npm run check failed"
            cat "$TEMP_DIRECTORY/npm-check.log" >> "$REPORT"
        fi
    fi
elif compgen -G "*.sln" >/dev/null; then
    if command_exists dotnet; then
        if dotnet restore; then pass "dotnet restore"; else fail "dotnet restore failed"; fi
        if dotnet build --no-restore; then pass "dotnet build"; else fail "dotnet build failed"; fi
        if dotnet test --no-build; then pass "dotnet test"; else fail "dotnet test failed"; fi
    else
        fail "dotnet unavailable for .NET build"
    fi
elif [ -f pom.xml ]; then
    if command_exists mvn; then
        if mvn -B verify; then pass "mvn verify"; else fail "mvn verify failed"; fi
    else
        fail "mvn unavailable for Maven build"
    fi
else
    info "no supported build system detected"
fi

echo ""
echo "======================="
echo "Result"
echo "======================="
echo "PASS : $PASS"
echo "WARN : $WARN"
echo "FAIL : $FAIL"

echo "" >> "$REPORT"
echo "## Result" >> "$REPORT"
echo "PASS : $PASS" >> "$REPORT"
echo "WARN : $WARN" >> "$REPORT"
echo "FAIL : $FAIL" >> "$REPORT"

if [ "$FAIL" -gt 0 ]; then
    echo ""
    echo "PUBLICATION BLOCKED"
    exit 1
fi

echo ""
echo "READY FOR MANUAL REVIEW"
exit 0
