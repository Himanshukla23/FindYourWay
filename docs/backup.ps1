# PathPilot AI — Phase Backup Script
# Usage: .\docs\backup.ps1 -Phase 1
# Run this from the root: C:\Users\himan\OneDrive\Desktop\Findyourway\

param(
    [Parameter(Mandatory=$true)]
    [int]$Phase,
    [string]$Label = ""
)

$Root      = $PSScriptRoot | Split-Path -Parent
$Source    = Join-Path $Root "pathpilot"
$BackupDir = Join-Path $Root "docs\backups"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$ZipName   = "phase-$Phase-backup-$Timestamp.zip"
$ZipPath   = Join-Path $BackupDir $ZipName
$Summary   = Join-Path $BackupDir "BACKUP_LOG.md"

# Create backup directory if it does not exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory: $BackupDir" -ForegroundColor Cyan
}

# Confirm the source folder exists
if (-not (Test-Path $Source)) {
    Write-Host "ERROR: pathpilot/ folder not found at $Source" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  PathPilot AI — Phase $Phase Backup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Source  : $Source"
Write-Host "Output  : $ZipPath"
Write-Host ""

# Collect files to zip (exclude node_modules and .next)
Write-Host "Collecting files (excluding node_modules and .next)..." -ForegroundColor Yellow
$Files = Get-ChildItem -Path $Source -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\.next\\' -and
    $_.FullName -notmatch '\\.git\\'
}

Write-Host "Found $($Files.Count) files to backup." -ForegroundColor Green

# Create the zip archive
Compress-Archive -Path $Files.FullName -DestinationPath $ZipPath -Force

$ZipSize = [math]::Round((Get-Item $ZipPath).Length / 1KB, 1)
Write-Host ""
Write-Host "Backup created: $ZipName ($ZipSize KB)" -ForegroundColor Green

# Git commit and tag (optional — only if git is initialised)
Push-Location $Source
$GitExists = Test-Path (Join-Path $Source ".git")
if ($GitExists) {
    Write-Host ""
    Write-Host "Git repository detected — creating commit and tag..." -ForegroundColor Yellow
    git add -A
    $CommitMsg = "chore: Phase $Phase complete backup"
    if ($Label) { $CommitMsg = "chore: Phase $Phase complete — $Label" }
    git commit -m $CommitMsg
    $TagName = "phase-$Phase-complete"
    git tag -a $TagName -m "Phase $Phase completed at $Timestamp"
    Write-Host "Git tag created: $TagName" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "No git repository found — skipping git commit. (Run 'git init' in pathpilot/ to enable)" -ForegroundColor DarkYellow
}
Pop-Location

# Append to backup log
$LogEntry = @"

## Phase $Phase Backup — $Timestamp
- **File:** $ZipName
- **Size:** $ZipSize KB
- **Files backed up:** $($Files.Count)
- **Label:** $(if ($Label) { $Label } else { "Phase $Phase complete" })
- **Git tag:** $(if ($GitExists) { "phase-$Phase-complete" } else { "Not created (no git repo)" })
"@

if (-not (Test-Path $Summary)) {
    "# PathPilot AI — Backup Log`n" | Out-File -FilePath $Summary -Encoding utf8
}
$LogEntry | Out-File -FilePath $Summary -Append -Encoding utf8

Write-Host ""
Write-Host "Backup log updated: docs\backups\BACKUP_LOG.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Done! Backup complete for Phase $Phase" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restore this backup, extract $ZipName to pathpilot/" -ForegroundColor DarkGray
Write-Host ""
