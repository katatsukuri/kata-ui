#!/usr/bin/env bash

set -u

PASS=0
WARN=0
FAIL=0

REPORT="public-audit-report.txt"

echo "Public Repository Audit" > "$REPORT"
echo "=======================" >> "$REPORT"
echo "" >> "$REPORT"


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


command_exists() {
    command -v "$1" >/dev/null 2>&1
}


echo "## Environment"

if command_exists git; then
    pass "git available"
else
    fail "git command not found"
fi


echo ""
echo "## Secret Scan"

if command_exists gitleaks; then

    if gitleaks dir . >/tmp/gitleaks-current.log 2>&1; then
        pass "current files secret scan"
    else
        fail "secret detected in current files"
        cat /tmp/gitleaks-current.log >> "$REPORT"
    fi


    if gitleaks git --log-opts="--all" . >/tmp/gitleaks-history.log 2>&1; then
        pass "git history secret scan"
    else
        fail "secret detected in git history"
        cat /tmp/gitleaks-history.log >> "$REPORT"
    fi

else
    warn "gitleaks not installed"
fi


echo ""
echo "## Suspicious Files"


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


for pattern in "${DANGEROUS_FILES[@]}"
do
    result=$(find . -name "$pattern" \
        -not -path "./.git/*" \
        2>/dev/null)

    if [ -n "$result" ]; then
        fail "dangerous file found: $pattern"
        echo "$result" >> "$REPORT"
    fi
done


echo ""
echo "## Secret-like Values"


SECRET_PATTERNS=(
    "password[ ]*="
    "secret[ ]*="
    "token[ ]*="
    "apikey[ ]*="
    "api_key[ ]*="
    "connectionstring[ ]*="
    "privatekey[ ]*="
)


for pattern in "${SECRET_PATTERNS[@]}"
do
    result=$(grep -RniE "$pattern" \
        --exclude-dir=.git \
        --exclude-dir=bin \
        --exclude-dir=obj \
        . 2>/dev/null || true)

    if [ -n "$result" ]; then
        warn "possible secret pattern: $pattern"
        echo "$result" >> "$REPORT"
    fi
done


echo ""
echo "## Repository Hygiene"


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


BAD_FILES=$(find . \
    -path "./.git" -prune -o \
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


echo ""
echo "## Documentation"


if [ -f README.md ]; then

    for section in \
        "Installation" \
        "Usage" \
        "License"
    do
        if grep -qi "$section" README.md; then
            pass "README contains $section"
        else
            warn "README missing section: $section"
        fi
    done

fi


echo ""
echo "## Build"


if ls *.sln >/dev/null 2>&1; then

    if command_exists dotnet; then

        if dotnet restore; then
            pass "dotnet restore"
        else
            fail "dotnet restore failed"
        fi


        if dotnet build --no-restore; then
            pass "dotnet build"
        else
            fail "dotnet build failed"
        fi


        if dotnet test --no-build; then
            pass "dotnet test"
        else
            fail "dotnet test failed"
        fi

    else
        warn "dotnet not installed"
    fi

else
    warn "no dotnet solution found"
fi


echo ""
echo "======================="
echo "Result"
echo "======================="

echo "PASS : $PASS"
echo "WARN : $WARN"
echo "FAIL : $FAIL"

echo "" >> "$REPORT"
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
