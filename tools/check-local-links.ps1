param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$rootPath = (Resolve-Path -LiteralPath $Root).Path
$attributePattern = '(?i)(?<![.:\w-])\b(?:href|src|lazy-src|poster|action)\s*=\s*(["''])(.*?)\1'
$missing = New-Object System.Collections.Generic.List[object]

function Test-IgnoredLink {
    param([string]$Link)

    if ([string]::IsNullOrWhiteSpace($Link)) { return $true }
    if ($Link.StartsWith('#')) { return $true }
    if ($Link -match '^(?i)(?:https?:)?//') { return $true }
    if ($Link -match '^(?i)(mailto|tel|javascript|data):') { return $true }
    if ($Link -match '[''"+<>]') { return $true }
    return $false
}

function Resolve-LocalLink {
    param(
        [string]$SourceFile,
        [string]$Link
    )

    $clean = ($Link -split '[?#]', 2)[0]
    if ([string]::IsNullOrWhiteSpace($clean)) { return $null }

    try {
        $decoded = [Uri]::UnescapeDataString($clean)
    } catch {
        $decoded = $clean
    }

    if ($decoded.StartsWith('/')) {
        return Join-Path $rootPath ($decoded.TrimStart('/') -replace '/', [IO.Path]::DirectorySeparatorChar)
    }

    return Join-Path (Split-Path -Parent $SourceFile) ($decoded -replace '/', [IO.Path]::DirectorySeparatorChar)
}

Get-ChildItem -LiteralPath $rootPath -Recurse -File |
    Where-Object { $_.Extension -in @('.html', '.htm') } |
    ForEach-Object {
        $source = $_.FullName
        $text = Get-Content -LiteralPath $source -Raw -Encoding UTF8
        if ($null -eq $text) { $text = '' }

        foreach ($match in [regex]::Matches($text, $attributePattern)) {
            $link = $match.Groups[2].Value.Trim()
            if (Test-IgnoredLink $link) { continue }

            $target = Resolve-LocalLink -SourceFile $source -Link $link
            if ($null -eq $target) { continue }

            $exists = Test-Path -LiteralPath $target
            if (-not $exists -and -not [IO.Path]::HasExtension($target)) {
                $exists = Test-Path -LiteralPath (Join-Path $target 'index.html')
            }

            if (-not $exists) {
                $missing.Add([pscustomobject]@{
                    File = $source.Substring($rootPath.Length + 1)
                    Link = $link
                })
            }
        }
    }

if ($missing.Count -eq 0) {
    Write-Host 'No missing local links found.'
    exit 0
}

$missing | Sort-Object File, Link | Format-Table -AutoSize
Write-Error "Found $($missing.Count) missing local links."
