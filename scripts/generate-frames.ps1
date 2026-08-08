# Generates the hero image sequence from your own video.
#
#   .\scripts\generate-frames.ps1 -Source .\_reference\my-video.mp4
#
# Then in src/lib/site.ts set:
#   baseUrl: "/sequence"
#   pattern: (n) => `frame_${String(n).padStart(4, "0")}.jpg`
#   count:   <number of files reported below>

param(
    [Parameter(Mandatory = $true)][string]$Source,
    [int]$Fps = 30,
    [int]$Width = 1920,
    [int]$Quality = 3,          # ffmpeg -q:v, 2 = best, 5 = smaller
    [string]$OutDir = "public/sequence"
)

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg not found on PATH. Install with: winget install Gyan.FFmpeg"
    exit 1
}

if (-not (Test-Path $Source)) {
    Write-Error "Source video not found: $Source"
    exit 1
}

New-Item -ItemType Directory -Force $OutDir | Out-Null
Remove-Item "$OutDir/frame_*.jpg" -ErrorAction SilentlyContinue

# scale=-2 keeps the height even, which JPEG encoding requires.
ffmpeg -i $Source -vf "fps=$Fps,scale=${Width}:-2" -q:v $Quality "$OutDir/frame_%04d.jpg"

$frames = Get-ChildItem "$OutDir/frame_*.jpg"
$sizeMb = [math]::Round(($frames | Measure-Object -Property Length -Sum).Sum / 1MB, 1)

Write-Host ""
Write-Host "Wrote $($frames.Count) frames to $OutDir ($sizeMb MB total)"
Write-Host "Set FRAMES.count = $($frames.Count) in src/lib/site.ts"

if ($sizeMb -gt 25) {
    Write-Host ""
    Write-Host "That is heavy for a hero. Consider -Fps 24, -Quality 5," -ForegroundColor Yellow
    Write-Host "or a shorter clip to bring it under ~20 MB." -ForegroundColor Yellow
}
