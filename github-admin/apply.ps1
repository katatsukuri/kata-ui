#Requires -Version 7.0

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$PolicyPath = (Join-Path $PSScriptRoot 'policy.json'),
    [switch]$ValidateOnly,
    [switch]$Execute,
    [ValidateSet('All', 'Organization', 'Repository', 'Ruleset')]
    [string[]]$Scope = @('All')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ApiVersion = '2026-03-10'
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

function Test-Scope {
    param([string]$Name)
    return ($Scope -contains 'All' -or $Scope -contains $Name)
}

function Invoke-PolicyValidation {
    $powerShellExecutable = (Get-Process -Id $PID).Path
    $arguments = @(
        '-NoProfile',
        '-File', (Join-Path $PSScriptRoot 'check.ps1'),
        '-PolicyPath', ([IO.Path]::GetFullPath($PolicyPath)),
        '-ValidateOnly'
    )
    & $powerShellExecutable @arguments
    if ($LASTEXITCODE -ne 0) {
        throw 'ポリシーのローカル検証に失敗しました。'
    }
}

function Read-JsonDocument {
    param([string]$Path)
    return Get-Content -Raw -LiteralPath $Path | ConvertFrom-Json -Depth 100
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
        }
    }
    catch {
        return [pscustomobject]@{
            Available = $false
            Value = $null
        }
    }
}

function Invoke-GhMutation {
    param(
        [ValidateSet('POST', 'PATCH', 'PUT')]
        [string]$Method,
        [string]$Endpoint,
        [object]$Payload
    )

    $temporaryFile = [IO.Path]::GetTempFileName()
    try {
        $json = ConvertTo-Json $Payload -Depth 100
        [IO.File]::WriteAllText($temporaryFile, $json, [Text.UTF8Encoding]::new($false))
        $raw = Invoke-GhCommand @(
            'api',
            '--method', $Method,
            '-H', 'Accept: application/vnd.github+json',
            '-H', "X-GitHub-Api-Version: $ApiVersion",
            '--input', $temporaryFile,
            $Endpoint
        )
        if (-not [string]::IsNullOrWhiteSpace($raw)) {
            return $raw | ConvertFrom-Json -Depth 100
        }
    }
    finally {
        Remove-Item -LiteralPath $temporaryFile -Force -ErrorAction SilentlyContinue
    }
}

function Get-SettingsPatch {
    param(
        [object]$Actual,
        [object]$Expected,
        [string[]]$Allowed,
        [string]$Label,
        [string]$Endpoint
    )

    $patch = [ordered]@{}
    foreach ($property in $Expected.PSObject.Properties) {
        if ($Allowed -notcontains $property.Name) {
            throw "$Label.$($property.Name) はapply許可リスト外です。"
        }
        $resolved = Get-ApiProperty $Actual $Endpoint $property.Name
        if (-not $resolved.Available) {
            throw "$Label.$($property.Name) をAPI結果から取得できません。権限または契約を確認してください。"
        }

        $actualJson = ConvertTo-Json $resolved.Value -Compress -Depth 20
        $expectedJson = ConvertTo-Json $property.Value -Compress -Depth 20
        if ($actualJson -cne $expectedJson) {
            $patch[$property.Name] = $property.Value
            Write-Host "[DRIFT] $Label.$($property.Name): $actualJson -> $expectedJson" -ForegroundColor Yellow
        }
    }
    return $patch
}

function Test-StringSetEqual {
    param([object[]]$Left, [object[]]$Right)
    $leftValues = @($Left | ForEach-Object { [string]$_ } | Sort-Object -Unique)
    $rightValues = @($Right | ForEach-Object { [string]$_ } | Sort-Object -Unique)
    return (($leftValues -join "`n") -ceq ($rightValues -join "`n"))
}

function Get-RulesetDrift {
    param([object]$Actual, [object]$Expected)

    $drift = @()
    foreach ($name in @('name', 'target', 'enforcement')) {
        if ([string]$Actual.$name -cne [string]$Expected.$name) {
            $drift += "$name mismatch"
        }
    }
    if (@($Actual.bypass_actors).Count -ne 0) {
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

function Invoke-ManagedVerification {
    $powerShellExecutable = (Get-Process -Id $PID).Path
    & $powerShellExecutable -NoProfile -File (Join-Path $PSScriptRoot 'check.ps1') `
        -PolicyPath ([IO.Path]::GetFullPath($PolicyPath)) -ManagedOnly -Scope $Scope
    if ($LASTEXITCODE -ne 0) {
        throw '適用後のmanaged設定検証に失敗しました。'
    }
}

Invoke-PolicyValidation
if ($ValidateOnly) {
    exit 0
}

if ($null -eq (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI (gh) がありません。'
}
Invoke-GhCommand @('auth', 'status', '--hostname', 'github.com') | Out-Null

$policy = Read-JsonDocument ([IO.Path]::GetFullPath($PolicyPath))
$organization = [string]$policy.organization
$repository = [string]$policy.repository
$repositoryEndpoint = "repos/$organization/$repository"

$plannedChanges = 0
$appliedMutation = $false

if (Test-Scope 'Organization') {
    $organizationEndpoint = "orgs/$organization"
    $organizationState = Invoke-GhApiJson $organizationEndpoint
    $organizationPatch = Get-SettingsPatch $organizationState $policy.organizationSettings `
        $AllowedOrganizationSettings 'organization' $organizationEndpoint

    if ($organizationPatch.Count -gt 0) {
        $plannedChanges += $organizationPatch.Count
        if ($Execute -and $PSCmdlet.ShouldProcess("organization $organization", 'PATCH safe organization settings')) {
            Invoke-GhMutation PATCH $organizationEndpoint $organizationPatch | Out-Null
            $appliedMutation = $true
            Write-Host '[APPLIED] Organization settings' -ForegroundColor Green
        }
        else {
            Write-Host '[DRY-RUN] Organization settingsを変更しません。' -ForegroundColor Cyan
        }
    }
}

if (Test-Scope 'Repository') {
    $repositoryState = Invoke-GhApiJson $repositoryEndpoint
    $repositoryPatch = Get-SettingsPatch $repositoryState $policy.repositorySettings `
        $AllowedRepositorySettings 'repository' $repositoryEndpoint

    if ($repositoryPatch.Count -gt 0) {
        $plannedChanges += $repositoryPatch.Count
        if ($Execute -and $PSCmdlet.ShouldProcess("repository $organization/$repository", 'PATCH safe repository settings')) {
            Invoke-GhMutation PATCH $repositoryEndpoint $repositoryPatch | Out-Null
            $appliedMutation = $true
            Write-Host '[APPLIED] Repository settings' -ForegroundColor Green
        }
        else {
            Write-Host '[DRY-RUN] Repository settingsを変更しません。' -ForegroundColor Cyan
        }
    }
}

if (Test-Scope 'Ruleset') {
    $rulesetSummaries = @(Invoke-GhApiJson "$repositoryEndpoint/rulesets?includes_parents=false&per_page=100")
    foreach ($relativePath in @($policy.rulesets)) {
        $rulesetPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ([string]$relativePath)))
        $expected = Read-JsonDocument $rulesetPath
        $matches = @($rulesetSummaries | Where-Object { $_.name -ceq $expected.name })
        if ($matches.Count -gt 1) {
            throw "同名Rulesetが複数あります。自動変更を停止します: $($expected.name)"
        }

        if ($matches.Count -eq 0) {
            $plannedChanges++
            Write-Host "[DRIFT] Ruleset missing: $($expected.name)" -ForegroundColor Yellow
            if ($Execute -and $PSCmdlet.ShouldProcess("ruleset $($expected.name)", 'CREATE repository ruleset')) {
                Invoke-GhMutation POST "$repositoryEndpoint/rulesets" $expected | Out-Null
                $appliedMutation = $true
                Write-Host "[APPLIED] Ruleset created: $($expected.name)" -ForegroundColor Green
            }
            else {
                Write-Host "[DRY-RUN] Rulesetを作成しません: $($expected.name)" -ForegroundColor Cyan
            }
            continue
        }

        $actual = Invoke-GhApiJson "$repositoryEndpoint/rulesets/$($matches[0].id)"
        $drift = @(Get-RulesetDrift $actual $expected)
        if ($drift.Count -gt 0) {
            $plannedChanges++
            Write-Host "[DRIFT] Ruleset $($expected.name): $($drift -join ', ')" -ForegroundColor Yellow
            if ($Execute -and $PSCmdlet.ShouldProcess("ruleset $($expected.name)", 'UPDATE repository ruleset')) {
                Invoke-GhMutation PUT "$repositoryEndpoint/rulesets/$($matches[0].id)" $expected | Out-Null
                $appliedMutation = $true
                Write-Host "[APPLIED] Ruleset updated: $($expected.name)" -ForegroundColor Green
            }
            else {
                Write-Host "[DRY-RUN] Rulesetを更新しません: $($expected.name)" -ForegroundColor Cyan
            }
        }
        else {
            Write-Host "[OK] Ruleset $($expected.name)" -ForegroundColor Green
        }
    }
}

if ($plannedChanges -eq 0) {
    Write-Host '[OK] managed設定にドリフトはありません。' -ForegroundColor Green
}
elseif (-not $Execute) {
    Write-Host "[INFO] $plannedChanges 件の変更候補があります。適用する場合だけ-Executeを指定してください。" -ForegroundColor Cyan
}

if ($Execute -and ($appliedMutation -or $plannedChanges -eq 0)) {
    Invoke-ManagedVerification
}
