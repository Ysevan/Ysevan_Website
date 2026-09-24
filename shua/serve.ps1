# 刷刷 v3.12.0
# Release: v3.12.0
# Author: Ysevan
# 仅限内部学习使用，请勿公开发布题库或源码。
param(
    [ValidateRange(1024, 65535)][int]$Port = 8765,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRootPrefix = $appRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$port = $Port
$localUrl = "http://localhost:$port/"
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Any, $port)

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.webmanifest' = 'application/manifest+json; charset=utf-8'
    '.xlsx' = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    '.png' = 'image/png'
    '.jpg' = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.svg' = 'image/svg+xml'
    '.ico' = 'image/x-icon'
    '.txt' = 'text/plain; charset=utf-8'
}
$publicFiles = @{
    'index.html' = $true
    'theme.js' = $true
    'styles.css' = $true
    'project.js' = $true
    'app.js' = $true
    'effects.js' = $true
    # 3.11.1 起 3D 只发布这一个经典脚本 bundle；effects-3d.js 与 vendor 下的 three、gsap 子集只是构建输入。
    'effects-3d.bundle.js' = $true
    'vendor/xlsx-import.js' = $true
    'questions.js' = $true
    'annual-inspection-2026-questions.js' = $true
    'annual-inspection-2026-comparison.js' = $true
    'domestic-settlement-questions.js' = $true
    'bill-finance-questions.js' = $true
    'bank-acceptance-questions.js' = $true
    'counterfeit-currency-2023-questions.js' = $true
    'foreign-exchange-2026-questions.js' = $true
    'warning-education-sanming-questions.js' = $true
    'fx-level-one-questions.js' = $true
    'manifest.webmanifest' = $true
    'sw.js' = $true
    'robots.txt' = $true
    'vendor/lucide.min.js' = $true
    'assets/brand/brand-icon.svg' = $true
    # png 是可选的备选 logo：白名单里有、磁盘上没有时正常回 404，页面按回落链换下一档。
    'assets/brand/brand-icon.png' = $true
    'assets/刷刷题库导入模板.xlsx' = $true
}

function Send-Response {
    param(
        [IO.Stream]$Stream,
        [int]$StatusCode,
        [string]$ContentType,
        [byte[]]$Body,
        [bool]$HeadOnly = $false
    )

    $statusText = switch ($StatusCode) {
        200 { 'OK' }
        400 { 'Bad Request' }
        404 { 'Not Found' }
        405 { 'Method Not Allowed' }
        default { 'Internal Server Error' }
    }
    $csp = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    $headers = @(
        "HTTP/1.1 $StatusCode $statusText"
        "Content-Type: $ContentType"
        "Content-Length: $($Body.Length)"
        'Connection: close'
        'Cache-Control: no-cache'
        'X-Robots-Tag: noindex, nofollow, noarchive, nosnippet'
        'Referrer-Policy: no-referrer'
        'X-Content-Type-Options: nosniff'
        'Permissions-Policy: camera=(), microphone=(), geolocation=()'
        "Content-Security-Policy: $csp"
        ''
        ''
    ) -join "`r`n"
    $headerBytes = [Text.Encoding]::ASCII.GetBytes($headers)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if (-not $HeadOnly -and $Body.Length) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
}

try {
    $listener.Start()
} catch {
    try {
        $existing = Invoke-WebRequest -Uri $localUrl -UseBasicParsing -TimeoutSec 2
        if ($existing.Content -match '<title>刷刷</title>') {
            Write-Host '刷题服务已经在运行，正在打开页面……' -ForegroundColor Yellow
            if (-not $NoBrowser) { Start-Process $localUrl }
            exit 0
        }
    } catch { }
    Write-Host "端口 $port 已被其他程序占用，刷题服务无法启动。请关闭占用该端口的程序后重试。" -ForegroundColor Red
    Read-Host '按回车键关闭窗口'
    exit 0
}

$lanEndpoints = foreach ($networkInterface in [Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces()) {
    if ($networkInterface.OperationalStatus -ne [Net.NetworkInformation.OperationalStatus]::Up -or $networkInterface.NetworkInterfaceType -eq [Net.NetworkInformation.NetworkInterfaceType]::Loopback) { continue }
    foreach ($unicast in $networkInterface.GetIPProperties().UnicastAddresses) {
        if ($unicast.Address.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork) { continue }
        $octets = $unicast.Address.GetAddressBytes()
        $isPrivate = $octets[0] -eq 10 -or ($octets[0] -eq 172 -and $octets[1] -ge 16 -and $octets[1] -le 31) -or ($octets[0] -eq 192 -and $octets[1] -eq 168)
        if ($isPrivate) {
            [PSCustomObject]@{ Address = $unicast.Address.ToString(); Interface = $networkInterface.Name }
        }
    }
}
# 必须用 @() 包成数组：只有一块网卡时 Sort-Object 只返回单个对象，
# 单个 PSCustomObject 上取 .Count 得到的是空值，会被误判成“没有局域网地址”。
$lanEndpoints = @($lanEndpoints | Sort-Object Address -Unique)

if (-not $NoBrowser) { Start-Process $localUrl }
Write-Host ''
Write-Host '刷刷已启动' -ForegroundColor Green
Write-Host "电脑访问：$localUrl"
if ($lanEndpoints.Count) {
    Write-Host ''
    Write-Host '手机 / 平板访问地址（与电脑连接同一 Wi-Fi）：' -ForegroundColor Cyan
    foreach ($endpoint in $lanEndpoints) {
        Write-Host "  http://$($endpoint.Address):$port/  [$($endpoint.Interface)]" -ForegroundColor Cyan
    }
} else {
    Write-Host '未检测到局域网 IPv4 地址，请确认电脑已连接 Wi-Fi 或有线网络。' -ForegroundColor Yellow
}
Write-Host ''
Write-Host '首次出现 Windows 防火墙提示时，请仅允许“专用网络”。'
Write-Host '鸿蒙、安卓、iPhone/iPad 均可直接使用系统浏览器打开，无需安装软件。'
Write-Host '使用期间请保持此窗口开启；关闭窗口即停止网页服务。'
Write-Host ''

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 10000
            $client.SendTimeout = 10000
            $stream = $client.GetStream()
            $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 8192, $true)
            $requestLine = $reader.ReadLine()
            while ($null -ne ($headerLine = $reader.ReadLine()) -and $headerLine -ne '') { }

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                Send-Response -Stream $stream -StatusCode 400 -ContentType 'text/plain; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes('Bad request'))
                continue
            }

            $parts = $requestLine.Split(' ')
            if ($parts.Length -lt 3 -or ($parts[0] -ne 'GET' -and $parts[0] -ne 'HEAD')) {
                Send-Response -Stream $stream -StatusCode 405 -ContentType 'text/plain; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes('Method not allowed'))
                continue
            }

            $headOnly = $parts[0] -eq 'HEAD'
            $requestPath = ($parts[1] -split '\?', 2)[0]
            try {
                $relativePath = [Uri]::UnescapeDataString($requestPath.TrimStart('/'))
            } catch {
                Send-Response -Stream $stream -StatusCode 400 -ContentType 'text/plain; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes('Bad request')) -HeadOnly $headOnly
                continue
            }
            if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }
            $relativePath = $relativePath.Replace('\', '/').TrimStart('/')
            $candidate = [IO.Path]::GetFullPath((Join-Path $appRoot $relativePath.Replace('/', [IO.Path]::DirectorySeparatorChar)))

            if ((-not $publicFiles.ContainsKey($relativePath)) -or -not $candidate.StartsWith($appRootPrefix, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
                Send-Response -Stream $stream -StatusCode 404 -ContentType 'text/plain; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes('Not found')) -HeadOnly $headOnly
                continue
            }

            $extension = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
            $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
            $bytes = [IO.File]::ReadAllBytes($candidate)
            Send-Response -Stream $stream -StatusCode 200 -ContentType $contentType -Body $bytes -HeadOnly $headOnly
        } catch {
            try {
                if ($stream -and $stream.CanWrite) {
                    Send-Response -Stream $stream -StatusCode 500 -ContentType 'text/plain; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes('Internal server error'))
                }
            } catch { }
        } finally {
            if ($reader) { $reader.Dispose() }
            if ($stream) { $stream.Dispose() }
            $client.Dispose()
            $reader = $null
            $stream = $null
        }
    }
} finally {
    $listener.Stop()
}






