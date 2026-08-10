#Requires -Version 7.0

[CmdletBinding()]
param(
    [string]$PolicyPath = (Join-Path $PSScriptRoot 'policy.json'),
    [switch]$ValidateOnly,
    [switch]$ManagedOnly,
    [ValidateSet('All', 'Organization', 'Repository', 'Ruleset', 'Manual')]
    [string[]]$Scope = @('All')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ApiVersion = '2026-03-10'
$PassCount = 0
$WarnCount = 0
$FailCount = 0

$AllowedOrganizationSettings = @(
    'default_repository_permission',
    'members_can_create_repositories',
    'members_can_create_public_repositories',
    'members_can_create_private_repositories',
    'members_can_create_internal_repositories',
    'members_can_fork_private_repositories',
    'web_commit_signoff_required',
    'has_organization_projects',
    'has_repository_projects'
)

$AllowedOrganizationAuditSettings = @(
    'members_can_delete_repositories',
    'members_can_change_repo_visibility',
    'members_can_create_teams',
    'members_can_invite_outside_collaborators'
)

$AllowedRepositorySettings = @(
    'has_issues',
    'has_wiki',
    'has_projects',
    'allow_squash_merge',
    'allow_merge_commit',
    'allow_rebase_merge',
    'allow_auto_merge',
    'allow_update_branch'
)

$AllowedManualChecks = @(
    'requireTwoFactorAuthentication',
    'auditMemberTwoFactor',
    'minimumOwnerCount',
    'warnWhenSingleOwner',
    'inventoryGitHubApps',
    'expectedVisibility',
    'expectedDefaultBranch'
)

function Write-Pass {
    param([string]$Message)
    $script:PassCount++
    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    $script:WarnCount++
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Message)
    $script:FailCount++
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Test-Scope {
    param([string]$Name)
    return ($Scope -contains 'All' -or $Scope -contains $Name)
}

function Read-JsonDocument {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "JSONファイルがありません: $Path"
    }

    try {
        return Get-Content -Raw -LiteralPath $Path | ConvertFrom-Json -Depth 100
    }
    catch {
        throw "JSONを解析できません: $Path`n$($_.Exception.Message)"
    }
}

function Assert-PropertyNames {
    param(
        [object]$Object,
        [string[]]$Allowed,
        [string]$Label
    )

    foreach ($name in $Object.PSObject.Properties.Name) {
        if ($Allowed -notcontains $name) {
            throw "$Label に適用対象外のプロパティがあります: $name"
        }
    }
}

function Test-StringSetEqual {
    param([object[]]$Left, [object[]]$Right)

    $leftValues = @($Left | ForEach-Object { [string]$_ } | Sort-Object -Unique)
    $rightValues = @($Right | ForEach-Object { [string]$_ } | Sort-Object -Unique)
    return (($leftValues -join "`n") -ceq ($rightValues -join "`n"))
}

function Resolve-RulesetPolicies {
    param([object]$Policy)

    $adminRoot = [IO.Path]::GetFullPath($PSScriptRoot)
    $resolvedPolicies = @()
    $names = @()

    foreach ($relativePath in @($Policy.rulesets)) {
        $fullPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ([string]$relativePath)))
        $requiredPrefix = $adminRoot + [IO.Path]::DirectorySeparatorChar
        if (-not $fullPath.StartsWith($requiredPrefix, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Rulesetパスがgithub-admin外を参照しています: $relativePath"
        }

        $ruleset = Read-JsonDocument -Path $fullPath
        Assert-PropertyNames -Object $ruleset -Allowed @(
            'name', 'target', 'enforcement', 'bypass_actors', 'conditions', 'rules'
        ) -Label "Ruleset $relativePath"

        if ([string]::IsNullOrWhiteSpace([string]$ruleset.name)) {
            throw "Ruleset nameが空です: $relativePath"
        }
        if ($names -contains [string]$ruleset.name) {
            throw "Ruleset nameが重複しています: $($ruleset.name)"
        }
        $names += [string]$ruleset.name

        if ($ruleset.target -ne 'branch' -or $ruleset.enforcement -ne 'active') {
            throw "Rulesetはtarget=branch、enforcement=activeに限定します: $relativePath"
        }
        if (@($ruleset.bypass_actors).Count -ne 0) {
            throw "Rulesetのbypass_actorsは空でなければなりません: $relativePath"
        }

        $includes = @($ruleset.conditions.ref_name.include)
        $excludes = @($ruleset.conditions.ref_name.exclude)
        if (-not (Test-StringSetEqual $includes @('refs/heads/main')) -or $excludes.Count -ne 0) {
            throw "Rulesetの対象はrefs/heads/mainだけに限定します: $relativePath"
        }

        $ruleTypes = @($ruleset.rules | ForEach-Object { $_.type })
        if (-not (Test-StringSetEqual $ruleTypes @('deletion', 'non_fast_forward'))) {
            throw "Rulesetはdeletionとnon_fast_forwardだけに限定します: $relativePath"
        }

        $resolvedPolicies += [pscustomobject]@{
            Path = $fullPath
            Document = $ruleset
        }
    }

    return $resolvedPolicies
}

function Read-AndValidatePolicy {
    $resolvedPolicyPath = [IO.Path]::GetFullPath($PolicyPath)
    $policy = Read-JsonDocument -Path $resolvedPolicyPath

    Assert-PropertyNames -Object $policy -Allowed @(
        'schemaVersion', 'organization', 'repository', 'organizationSettings',
        'organizationAuditSettings', 'repositorySettings', 'manualChecks', 'rulesets'
    ) -Label 'policy.json'

    if ($policy.schemaVersion -ne 2) {
        throw "未対応のschemaVersionです: $($policy.schemaVersion)"
    }
    if ([string]$policy.organization -notmatch '^[A-Za-z0-9_.-]+$') {
        throw 'organizationが不正です。'
    }
    if ([string]$policy.repository -notmatch '^[A-Za-z0-9_.-]+$') {
        throw 'repositoryが不正です。'
    }

    Assert-PropertyNames $policy.organizationSettings $AllowedOrganizationSettings 'organizationSettings'
    Assert-PropertyNames $policy.organizationAuditSettings $AllowedOrganizationAuditSettings 'organizationAuditSettings'
    Assert-PropertyNames $policy.repositorySettings $AllowedRepositorySettings 'repositorySettings'
    Assert-PropertyNames $policy.manualChecks $AllowedManualChecks 'manualChecks'

    if ($policy.organizationSettings.default_repository_permission -ne 'none') {
        throw 'default_repository_permissionはnoneに固定します。'
    }
    foreach ($property in $policy.organizationSettings.PSObject.Properties) {
        if ($property.Name -ne 'default_repository_permission' -and $property.Value -isnot [bool]) {
            throw "organizationSettings.$($property.Name) はbooleanでなければなりません。"
        }
    }
    foreach ($property in $policy.organizationAuditSettings.PSObject.Properties) {
        if ($property.Value -isnot [bool]) {
            throw "organizationAuditSettings.$($property.Name) はbooleanでなければなりません。"
        }
    }
    foreach ($property in $policy.repositorySettings.PSObject.Properties) {
        if ($property.Value -isnot [bool]) {
            throw "repositorySettings.$($property.Name) はbooleanでなければなりません。"
        }
    }
    if ([int]$policy.manualChecks.minimumOwnerCount -lt 1) {
        throw 'minimumOwnerCountは1以上でなければなりません。'
    }
    if ([string]$policy.manualChecks.expectedVisibility -notin @('public', 'private', 'internal')) {
        throw 'expectedVisibilityが不正です。'
    }
    if (@($policy.rulesets).Count -eq 0) {
        throw 'rulesetsを1件以上指定してください。'
    }

    $rulesetPolicies = @(Resolve-RulesetPolicies -Policy $policy)
    return [pscustomobject]@{
        Policy = $policy
        Rulesets = $rulesetPolicies
    }
}

function Invoke-GhCommand {
    param([string[]]$Arguments)

    $output = @(& gh @Arguments 2>&1)
    $exitCode = $LASTEXITCODE
    $text = ($output | ForEach-Object { $_.ToString() }) -join [Environment]::NewLine
    if ($exitCode -ne 0) {
        throw "gh $($Arguments -join ' ') が失敗しました。`n$text"
    }
    return $text
}

function Invoke-GhApiJson {
    param([string]$Endpoint)

    $raw = Invoke-GhCommand @(
        'api',
        '-H', 'Accept: application/vnd.github+json',
        '-H', "X-GitHub-Api-Version: $ApiVersion",
        $Endpoint
    )
    if ([string]::IsNullOrWhiteSpace($raw)) {
        return $null
    }
    return $raw | ConvertFrom-Json -Depth 100
}

function Invoke-GhApiLines {
    param([string]$Endpoint, [string]$Jq)

    $raw = Invoke-GhCommand @(
        'api',
        '-H', 'Accept: application/vnd.github+json',
        '-H', "X-GitHub-Api-Version: $ApiVersion",
        '--paginate',
        '--jq', $Jq,
        $Endpoint
    )
    if ([string]::IsNullOrWhiteSpace($raw)) {
        return @()
    }
    return @($raw -split '\r?\n' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
}

function Get-ApiProperty {
    param(
        [AllowNull()][object]$Actual,
        [string]$Endpoint,
        [string]$Name
    )

    if ($null -ne $Actual) {
        $property = $Actual.PSObject.Properties[$Name]
        if ($null -ne $property) {
            return [pscustomobject]@{
                Available = $true
                Value = $property.Value
                Source = 'bulk'
                Error = $null
            }
        }
    }

    try {
        $selection = "{available: has(`"$Name`"), value: .$Name}"
        $raw = Invoke-GhCommand @(
            'api',
            '-H', 'Accept: application/vnd.github+json',
            '-H', "X-GitHub-Api-Version: $ApiVersion",
            '--jq', $selection,
            $Endpoint
        )
        $result = $raw | ConvertFrom-Json -Depth 20
        return [pscustomobject]@{
            Available = [bool]$result.available
            Value = $result.value
            Source = 'field-fallback'
            Error = $null
        }
    }
    catch {
        return [pscustomobject]@{
            Available = $false
            Value = $null
            Source = 'unavailable'
            Error = $_.Exception.Message
        }
    }
}

function Test-Settings {
    param(
        [AllowNull()][object]$Actual,
        [object]$Expected,
        [string]$Label,
        [string]$Endpoint
    )

    foreach ($property in $Expected.PSObject.Properties) {
        $resolved = Get-ApiProperty $Actual $Endpoint $property.Name
        if (-not $resolved.Available) {
            $detail = if ($resolved.Error) { ": $($resolved.Error)" } else { '' }
            Write-Warn "$Label.$($property.Name) をAPI結果から取得できません$detail; 手動確認してください"
            continue
        }

        if ($resolved.Source -eq 'field-fallback') {
            Write-Info "$Label.$($property.Name) はfield fallbackで取得しました"
        }
        $actualJson = ConvertTo-Json $resolved.Value -Compress -Depth 20
        $expectedJson = ConvertTo-Json $property.Value -Compress -Depth 20
        if ($actualJson -ceq $expectedJson) {
            Write-Pass "$Label.$($property.Name) = $expectedJson"
        }
        else {
            Write-Fail "$Label.$($property.Name): actual=$actualJson expected=$expectedJson"
        }
    }
}

function Test-AuditSettings {
    param(
        [AllowNull()][object]$Actual,
        [object]$Expected,
        [string]$Label,
        [string]$Endpoint
    )

    foreach ($property in $Expected.PSObject.Properties) {
        $resolved = Get-ApiProperty $Actual $Endpoint $property.Name
        if (-not $resolved.Available) {
            Write-Warn "$Label.$($property.Name) をAPI結果から取得できません; GitHub UIで手動確認してください"
            continue
        }

        $actualJson = ConvertTo-Json $resolved.Value -Compress -Depth 20
        $expectedJson = ConvertTo-Json $property.Value -Compress -Depth 20
        if ($actualJson -ceq $expectedJson) {
            Write-Pass "$Label.$($property.Name) = $expectedJson (audit-only)"
            continue
        }

        if ($property.Name -eq 'members_can_invite_outside_collaborators') {
            Write-Warn "$Label.$($property.Name): actual=$actualJson expected=$expectedJson; REST APIの更新対象外で、招待制限はGitHub Enterprise Cloudで確認してください"
        }
        else {
            Write-Warn "$Label.$($property.Name): actual=$actualJson expected=$expectedJson; REST APIの更新対象外のためGitHub UIで手動確認してください"
        }
    }
}

function Get-RulesetDrift {
    param([object]$Actual, [object]$Expected)

    $drift = @()
    foreach ($name in @('name', 'target', 'enforcement')) {
        if ([string]$Actual.$name -cne [string]$Expected.$name) {
            $drift += "$name mismatch"
        }
    }
    if (@($Actual.bypass_actors).Count -ne @($Expected.bypass_actors).Count) {
        $drift += 'bypass_actors mismatch'
    }
    if (-not (Test-StringSetEqual @($Actual.conditions.ref_name.include) @($Expected.conditions.ref_name.include))) {
        $drift += 'conditions.ref_name.include mismatch'
    }
    if (-not (Test-StringSetEqual @($Actual.conditions.ref_name.exclude) @($Expected.conditions.ref_name.exclude))) {
        $drift += 'conditions.ref_name.exclude mismatch'
    }
    if (-not (Test-StringSetEqual @($Actual.rules | ForEach-Object { $_.type }) @($Expected.rules | ForEach-Object { $_.type }))) {
        $drift += 'rules mismatch'
    }
    return $drift
}

try {
    $validated = Read-AndValidatePolicy
    $policy = $validated.Policy
    Write-Pass 'policy and ruleset JSON are valid'

    if ($ValidateOnly) {
        Write-Info 'ValidateOnly: GitHub APIは呼び出していません。'
        exit 0
    }

    if ($null -eq (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw 'GitHub CLI (gh) がありません。'
    }
    Invoke-GhCommand @('auth', 'status', '--hostname', 'github.com') | Out-Null

    $organization = [string]$policy.organization
    $repository = [string]$policy.repository
    $organizationEndpoint = "orgs/$organization"
    $repositoryEndpoint = "repos/$organization/$repository"
    $organizationState = $null
    $repositoryState = $null

    if ((Test-Scope 'Organization') -or (Test-Scope 'Manual')) {
        try {
            $organizationState = Invoke-GhApiJson $organizationEndpoint
        }
        catch {
            Write-Warn "Organization APIを取得できません: $($_.Exception.Message)"
        }
    }
    if ((Test-Scope 'Repository') -or (Test-Scope 'Manual')) {
        try {
            $repositoryState = Invoke-GhApiJson $repositoryEndpoint
        }
        catch {
            Write-Warn "Repository APIを取得できません: $($_.Exception.Message)"
        }
    }

    if (Test-Scope 'Organization') {
        Write-Host "`n## Organization settings"
        if ($null -eq $organizationState) {
            Write-Warn 'Organization設定は取得できないため手動確認対象です'
        }
        else {
            Test-Settings $organizationState $policy.organizationSettings 'organization' $organizationEndpoint
            Test-AuditSettings $organizationState $policy.organizationAuditSettings 'organization' $organizationEndpoint
        }
    }

    if (Test-Scope 'Repository') {
        Write-Host "`n## Repository settings"
        if ($null -eq $repositoryState) {
            Write-Warn 'Repository設定は取得できないため手動確認対象です'
        }
        else {
            Test-Settings $repositoryState $policy.repositorySettings 'repository' $repositoryEndpoint
        }
    }

    if (Test-Scope 'Ruleset') {
        Write-Host "`n## Repository rulesets"
        try {
            $rulesetSummaries = @(Invoke-GhApiJson "$repositoryEndpoint/rulesets?includes_parents=false&per_page=100")
            foreach ($rulesetPolicy in $validated.Rulesets) {
                $expected = $rulesetPolicy.Document
                $matches = @($rulesetSummaries | Where-Object { $_.name -ceq $expected.name })
                if ($matches.Count -eq 0) {
                    Write-Fail "ruleset missing: $($expected.name)"
                    continue
                }
                if ($matches.Count -gt 1) {
                    Write-Fail "ruleset name duplicated: $($expected.name)"
                    continue
                }

                $actual = Invoke-GhApiJson "$repositoryEndpoint/rulesets/$($matches[0].id)"
                $drift = @(Get-RulesetDrift $actual $expected)
                if ($drift.Count -eq 0) {
                    Write-Pass "ruleset $($expected.name)"
                }
                else {
                    Write-Fail "ruleset $($expected.name): $($drift -join ', ')"
                }
            }
        }
        catch {
            Write-Warn "Ruleset APIを取得できません: $($_.Exception.Message)"
        }
    }

    if (-not $ManagedOnly -and (Test-Scope 'Manual')) {
        Write-Host "`n## Manual security checks"
        $manual = $policy.manualChecks

        $twoFactor = Get-ApiProperty $organizationState $organizationEndpoint 'two_factor_requirement_enabled'
        if (-not $twoFactor.Available) {
            Write-Warn '2FA requirementをAPI結果から取得できません; Organization Owner権限とGitHub UIで手動確認してください'
        }
        elseif ([bool]$twoFactor.Value -eq [bool]$manual.requireTwoFactorAuthentication) {
            Write-Pass "2FA requirement = $($manual.requireTwoFactorAuthentication)"
        }
        else {
            Write-Fail "2FA requirement: actual=$($twoFactor.Value) expected=$($manual.requireTwoFactorAuthentication); GitHub UIで変更してください"
        }

        $visibility = Get-ApiProperty $repositoryState $repositoryEndpoint 'visibility'
        if (-not $visibility.Available) {
            Write-Warn 'repository visibilityをAPI結果から取得できません; 手動確認してください'
        }
        elseif ([string]$visibility.Value -ceq [string]$manual.expectedVisibility) {
            Write-Pass "repository visibility = $($manual.expectedVisibility)"
        }
        else {
            Write-Fail "repository visibility: actual=$($visibility.Value) expected=$($manual.expectedVisibility); 自動変更しません"
        }

        $defaultBranch = Get-ApiProperty $repositoryState $repositoryEndpoint 'default_branch'
        if (-not $defaultBranch.Available) {
            Write-Warn 'default branchをAPI結果から取得できません; 手動確認してください'
        }
        elseif ([string]$defaultBranch.Value -ceq [string]$manual.expectedDefaultBranch) {
            Write-Pass "default branch = $($manual.expectedDefaultBranch)"
        }
        else {
            Write-Fail "default branch: actual=$($defaultBranch.Value) expected=$($manual.expectedDefaultBranch); 自動変更しません"
        }

        try {
            $owners = @(Invoke-GhApiLines "orgs/$organization/members?role=admin&per_page=100" '.[].login')
            Write-Info "Organization owners ($($owners.Count)): $($owners -join ', ')"
            if ($owners.Count -lt [int]$manual.minimumOwnerCount) {
                Write-Fail "Organization owner count is below $($manual.minimumOwnerCount)"
            }
            else {
                Write-Pass "Organization owner count >= $($manual.minimumOwnerCount)"
            }
            if ([bool]$manual.warnWhenSingleOwner -and $owners.Count -eq 1) {
                Write-Warn 'Organization owner is only one; 自動変更しません'
            }
        }
        catch {
            Write-Warn "Organization owner一覧を取得できません: $($_.Exception.Message)"
        }

        if ([bool]$manual.auditMemberTwoFactor) {
            foreach ($filter in @('2fa_disabled', '2fa_insecure')) {
                try {
                    $members = @(Invoke-GhApiLines "orgs/$organization/members?filter=$filter&per_page=100" '.[].login')
                    if ($members.Count -eq 0) {
                        Write-Pass "members filter $filter = 0"
                    }
                    else {
                        Write-Warn "members filter $filter ($($members.Count)): $($members -join ', '); 自動変更しません"
                    }
                }
                catch {
                    Write-Warn "members filter $filter を取得できません: $($_.Exception.Message)"
                }
            }
        }

        if ([bool]$manual.inventoryGitHubApps) {
            try {
                $apps = @(Invoke-GhApiLines "orgs/$organization/installations?per_page=100" '.installations[] | [.app_slug, .repository_selection] | @tsv')
                if ($apps.Count -eq 0) {
                    Write-Info 'Installed GitHub Apps: none'
                }
                else {
                    Write-Info "Installed GitHub Apps:`n  $($apps -join "`n  ")"
                }
                Write-Pass 'GitHub Apps inventory completed'
            }
            catch {
                Write-Warn "GitHub Apps一覧を取得できません: $($_.Exception.Message)"
            }
        }
    }
}
catch {
    Write-Fail $_.Exception.Message
}

Write-Host "`nPASS=$PassCount WARN=$WarnCount FAIL=$FailCount"
if ($FailCount -gt 0) {
    exit 1
}
exit 0
