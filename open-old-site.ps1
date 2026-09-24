# 由「打开老站.bat」调用（文件名用英文，免得 .bat 读中文路径出错）：在本机起一个只读的本地服务器，打开书生子白首页。关掉窗口就停了。
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8766
while (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { $port++ }
$types = @{ '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8'; '.js'='text/javascript'; '.css'='text/css';
  '.json'='application/json'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg';
  '.gif'='image/gif'; '.ico'='image/x-icon'; '.mp3'='audio/mpeg'; '.m4a'='audio/mp4'; '.ogg'='audio/ogg'; '.wav'='audio/wav';
  '.mp4'='video/mp4'; '.woff'='font/woff'; '.woff2'='font/woff2'; '.ttf'='font/ttf'; '.txt'='text/plain; charset=utf-8' }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "老站已在 http://localhost:$port 打开，关掉这个窗口就停止。"
Start-Process "http://localhost:$port/Blog/Home.html"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  $file = [IO.Path]::GetFullPath((Join-Path $root $rel))
  if (Test-Path $file -PathType Container) { $file = Join-Path $file 'index.html' }
  if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf)) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else { $ctx.Response.StatusCode = 404 }
  $ctx.Response.Close()
}
