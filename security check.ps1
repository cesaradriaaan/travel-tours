$ErrorActionPreference = "Stop"

$repositoryRoot = git rev-parse --show-toplevel 2>$null

if (-not $repositoryRoot) {
  Write-Host "FAIL: Run this script inside the travel-tours Git repository."
  exit 1
}

Push-Location $repositoryRoot

try {
  $failed = $false
  $environmentPathPattern = '(^|/)\.env($|\.)'
  $safeExamplePattern = '(^|/)(\.env\.example|[^/]+\.env\.example)$'

  $trackedFiles = @(git ls-files)
  $trackedEnvironmentFiles = @(
    $trackedFiles |
      Where-Object {
        $_ -match $environmentPathPattern -and
        $_ -notmatch $safeExamplePattern
      }
  )

  if ($trackedEnvironmentFiles.Count -gt 0) {
    $failed = $true
    Write-Host "FAIL: Git currently tracks environment files:"
    $trackedEnvironmentFiles |
      ForEach-Object {
        Write-Host "  - $_"
      }
  } else {
    Write-Host "PASS: Git does not currently track environment files."
  }

  $historicalFiles = @(
    git log --all --name-only --pretty=format: |
      Where-Object {
        $_ -match $environmentPathPattern -and
        $_ -notmatch $safeExamplePattern
      } |
      Sort-Object -Unique
  )

  if ($historicalFiles.Count -gt 0) {
    $failed = $true
    Write-Host "FAIL: Environment-file paths exist in Git history:"
    $historicalFiles |
      ForEach-Object {
        Write-Host "  - $_"
      }
    Write-Host "Rotate credentials before launch if real secrets were ever committed."
  } else {
    Write-Host "PASS: No environment-file path was found in Git history."
  }

  $secretRules = @(
    @{
      Name = "JWT-like token"
      Pattern = '\beyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b'
    },
    @{
      Name = "Supabase secret key"
      Pattern = '\bsb_secret_[A-Za-z0-9_-]{20,}\b'
    },
    @{
      Name = "Resend API key"
      Pattern = '\bre_[A-Za-z0-9_-]{20,}\b'
    },
    @{
      Name = "GitHub token"
      Pattern = '\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b'
    },
    @{
      Name = "Private key"
      Pattern = '-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'
    }
  )

  $textExtensions = @(
    ".js", ".jsx", ".json", ".md", ".txt", ".html",
    ".css", ".sql", ".yml", ".yaml", ".toml", ".ps1"
  )

  $findings = @()

  foreach ($relativePath in $trackedFiles) {
    $extension = [System.IO.Path]::GetExtension($relativePath).ToLowerInvariant()

    if ($textExtensions -notcontains $extension) {
      continue
    }

    $fullPath = Join-Path $repositoryRoot $relativePath

    if (
      -not (Test-Path -LiteralPath $fullPath -PathType Leaf) -or
      (Get-Item -LiteralPath $fullPath).Length -gt 2MB
    ) {
      continue
    }

    $content = Get-Content -LiteralPath $fullPath -Raw

    foreach ($rule in $secretRules) {
      if ($content -match $rule.Pattern) {
        $findings += "$relativePath ($($rule.Name))"
      }
    }
  }

  if ($findings.Count -gt 0) {
    $failed = $true
    Write-Host "FAIL: Possible credential values were found in tracked files:"
    $findings |
      Sort-Object -Unique |
      ForEach-Object {
        Write-Host "  - $_"
      }
  } else {
    Write-Host "PASS: No common credential pattern was found in current tracked files."
  }

  if ($failed) {
    Write-Host "RESULT: REVIEW REQUIRED"
    exit 1
  }

  Write-Host "RESULT: TARGETED GIT SECRET CHECK PASSED"
  exit 0
} finally {
  Pop-Location
}