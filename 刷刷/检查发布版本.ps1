# 综合服务经理刷题 - 发布版本一致性检查
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$failures = [Collections.Generic.List[string]]::new()

function Read-Utf8File {
    param([string]$Name)
    return [IO.File]::ReadAllText((Join-Path $root $Name), [Text.Encoding]::UTF8)
}

function Require-Text {
    param([string]$File, [string]$Expected, [string]$Description)
    $content = Read-Utf8File $File
    if (-not $content.Contains($Expected)) {
        $failures.Add(('{0}：缺少{1}（应包含：{2}）' -f $File, $Description, $Expected))
    }
}

$version = (Read-Utf8File 'VERSION').Trim()
if ($version -notmatch '^\d+\.\d+\.\d+$') {
    $failures.Add(('VERSION：版本号“{0}”不符合 主版本.次版本.修订版本 格式' -f $version))
}

$projectText = Read-Utf8File 'project.js'
$releaseDateMatch = [regex]::Match($projectText, 'releaseDate:\s*"(\d{4}-\d{2}-\d{2})"')
if (-not $releaseDateMatch.Success) {
    $failures.Add('project.js：未找到有效的 releaseDate')
    $releaseDate = 'YYYY-MM-DD'
} else {
    $releaseDate = $releaseDateMatch.Groups[1].Value
}

Require-Text 'project.js' "version: `"$version`"" '运行时版本'
Require-Text 'app.js' "v$version" '兜底版本'
Require-Text 'index.html' "v$version · Ysevan" '页面初始版本角标'
Require-Text 'index.html' "styles.css?v=$version" '样式资源版本参数'
Require-Text 'index.html' "project.js?v=$version" '项目信息资源版本参数'
Require-Text 'index.html' "questions.js?v=$version" '原内置题库资源版本参数'
Require-Text 'index.html' "annual-inspection-2026-comparison.js?v=$version" '新旧题库对比资源版本参数'
Require-Text 'index.html' "vendor/xlsx-import.js?v=$version" 'Excel 导入组件资源版本参数'
Require-Text 'index.html' "app.js?v=$version" '应用脚本版本参数'
Require-Text 'manifest.webmanifest' "`"version`": `"$version`"" '清单版本'
Require-Text 'serve.ps1' "v$version" '本地服务版本'
Require-Text 'serve.mjs' "v$version" 'macOS 本地服务版本'
Require-Text '打开刷刷.bat' 'serve.ps1' 'Windows 独立启动入口'
Require-Text '打开刷刷.command' 'serve.mjs' 'macOS 独立启动入口'
Require-Text 'sw.js' "v$version" '离线缓存文件头版本'
Require-Text 'sw.js' "app.js?v=$version" '离线缓存资源版本参数'
Require-Text 'sw.js' "annual-inspection-2026-comparison.js?v=$version" '新旧题库对比离线缓存资源参数'
Require-Text 'sw.js' "vendor/xlsx-import.js?v=$version" 'Excel 导入组件离线缓存资源参数'
Require-Text 'serve.ps1' "'annual-inspection-2026-comparison.js'" '新旧题库对比本地服务白名单'
Require-Text 'serve.ps1' "'vendor/xlsx-import.js'" 'Excel 导入组件本地服务白名单'
Require-Text 'serve.ps1' "'assets/刷刷题库导入模板.xlsx'" 'Excel 模板本地服务白名单'
Require-Text 'serve.mjs' '"assets/刷刷题库导入模板.xlsx"' 'Excel 模板 macOS 本地服务白名单'
Require-Text 'annual-inspection-2026-comparison.js' "v$version" '新旧题库对比生成版本'
Require-Text 'README.md' "当前版本：``v$version``" 'README 当前版本'
Require-Text '使用说明.txt' "当前版本：v$version" '使用说明当前版本'
Require-Text '项目管理.md' "| 正式版本 | $version |" '项目基线版本'
Require-Text 'NOTICE.txt' "v$version" '声明文件版本'
Require-Text 'CHANGELOG.md' '## [Unreleased]' '未发布变更区'
Require-Text 'CHANGELOG.md' "## [$version] - $releaseDate" '当前正式版本更新记录'

$bundledBanks = @(
    'annual-inspection-2026-questions.js',
    'domestic-settlement-questions.js',
    'bill-finance-questions.js',
    'bank-acceptance-questions.js',
    'counterfeit-currency-2023-questions.js',
    'foreign-exchange-2026-questions.js',
    'warning-education-sanming-questions.js',
    'fx-level-one-questions.js'
)
foreach ($bankFile in $bundledBanks) {
    Require-Text 'index.html' "$bankFile?v=$version" "$bankFile 页面资源参数"
    Require-Text 'sw.js' "$bankFile?v=$version" "$bankFile 离线缓存资源参数"
    Require-Text 'serve.ps1' "'$bankFile'" "$bankFile 本地服务白名单"
    Require-Text 'serve.mjs' "`"$bankFile`"" "$bankFile macOS 本地服务白名单"
    Require-Text $bankFile "v$version" "$bankFile 生成版本"
}

foreach ($launcherFile in @('打开刷刷.bat', '打开刷刷.command')) {
    $launcherText = Read-Utf8File $launcherFile
    foreach ($forbidden in @('DATABASE_URL', 'db:deploy', 'db:seed', 'docker compose', 'localhost:3000')) {
        if ($launcherText.Contains($forbidden)) {
            $failures.Add(("{0}：刷刷启动器不得连接小屋或数据库（发现：{1}）" -f $launcherFile, $forbidden))
        }
    }
}

if ($projectText -notmatch 'changes:\s*Object\.freeze\(\[\s*".+"') {
    $failures.Add('project.js：changes 不能为空，必须填写本次用户可见更新')
}
if ((Read-Utf8File 'sw.js') -notmatch 'const CACHE = "zongfu-quiz-v\d+";') {
    $failures.Add('sw.js：缓存名必须使用独立递增代次，例如 zongfu-quiz-v9')
}

# stats.json 给小屋主站工具页用（几个题库、多少道题）。由 scripts/release-check.mjs 从题库文件
# 实点生成；这里只核对版本号跟上了，防止改了 VERSION 却忘了重新生成。
try {
    $stats = (Read-Utf8File 'stats.json') | ConvertFrom-Json
    if ($stats.version -ne $version) {
        $failures.Add(('stats.json：版本仍是 {0}，与 VERSION {1} 不一致。先运行 node scripts/release-check.mjs 重新生成' -f $stats.version, $version))
    }
} catch {
    $failures.Add('stats.json：缺失或无法解析。先运行 node scripts/release-check.mjs 生成')
}

if ($failures.Count) {
    Write-Host "发布检查失败，共 $($failures.Count) 项：" -ForegroundColor Red
    foreach ($failure in $failures) { Write-Host "- $failure" -ForegroundColor Red }
    exit 1
}

Write-Host "发布版本检查通过：v$version · $releaseDate" -ForegroundColor Green
Write-Host '版本镜像、更新日志、资源参数和缓存命名均已核对。'
