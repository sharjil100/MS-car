<#
  encode-hero.ps1: turns any source clip into the adaptive hero-video set.

  Produces in assets/video/:
    hero-1080.webm/.mp4   1920x1080  (desktop)
    hero-720.webm/.mp4    1280x720   (laptops / slow connections)
    hero-480.webm/.mp4     854x480   (fallback)
    hero-mobile.webm/.mp4  720x1280  (portrait phones: pre-cropped, so no bytes are wasted)
    hero-poster.jpg                  (shows instantly; identical to frame 1 of the loop)

  Each file is silent, roughly 0.6 to 3 MB, and loops seamlessly: the last
  second crossfades into the first, so the loop has no visible jump.

  Usage:
    .\tools\encode-hero.ps1 -Source source\fb-video.mp4 -Start 4 -Duration 12
    -FocusX 0.0 .. 1.0  horizontal focus point for the portrait crop (0.5 = centre)
    -Fade 0             disables the crossfade loop
    -Sharpen 0.8 -RateScale 1.8   denoise + sharpen soft sources, spend more bits
    -Renditions 720,480 build only some sizes (skip 1080 when the source is smaller)
    Portrait clip for phones only:
      -Renditions mobile -PosterName hero-poster-mobile.jpg -PosterSize 720:1280
#>
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [double]$Start = 0,
  [double]$Duration = 12,
  [double]$Fade = 1,
  [double]$FocusX = 0.5,
  [string[]]$Renditions = @("1080", "720", "480", "mobile"),
  [string]$PosterName = "hero-poster.jpg",
  [string]$PosterSize = "1600:900",
  [double]$Sharpen = 0,      # 0 = off; 0.5-1.0 = mild clean-up of soft (e.g. Facebook) footage
  [double]$RateScale = 1,    # multiply all bitrates, e.g. 1.8 for soft sources
  [string]$OutDir = (Join-Path $PSScriptRoot "..\assets\video")
)
$ErrorActionPreference = "Stop"
if (-not (Test-Path $Source)) { throw "Source not found: $Source" }
New-Item -ItemType Directory -Force $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path
$inv = [System.Globalization.CultureInfo]::InvariantCulture
function F([double]$n) { $n.ToString($inv) }

$master = Join-Path $env:TEMP "ms-hero-master.mp4"

# ---- 1. Master loop (high quality intermediate) ----
Write-Host "Building master loop..." -ForegroundColor Cyan
# Keep the source size and aspect; renditions crop/scale from here
$base = "fps=30,format=yuv420p"
if ($Sharpen -gt 0) { $base += ",hqdn3d=1.5:1.5:4:4,unsharp=5:5:$(F $Sharpen):3:3:0" }
if ($Fade -gt 0) {
  $total = $Duration + $Fade
  $fc = "[0:v]$base,split[a][b];" +
        "[a]trim=start=$(F $Fade):duration=$(F $Duration),setpts=PTS-STARTPTS[main];" +
        "[b]trim=start=0:duration=$(F $Fade),setpts=PTS-STARTPTS[head];" +
        "[main][head]xfade=transition=fade:duration=$(F $Fade):offset=$(F ($Duration - $Fade))[v]"
} else {
  $total = $Duration
  $fc = "[0:v]$base[v]"
}
& ffmpeg -hide_banner -loglevel error -y -ss (F $Start) -t (F $total) -i $Source `
  -filter_complex $fc -map "[v]" -an -c:v libx264 -crf 12 -preset medium $master
if ($LASTEXITCODE) { throw "master encode failed" }

# ---- 2. Delivery renditions ----
$all = @(
  @{ name = "1080";   vf = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080"; rate = "2000k" },
  @{ name = "720";    vf = "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720";   rate = "1100k" },
  @{ name = "480";    vf = "scale=854:480:force_original_aspect_ratio=increase,crop=854:480";     rate = "550k"  },
  @{ name = "mobile"; vf = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280:(iw-720)*$(F $FocusX):(ih-1280)/2"; rate = "1000k" }
)

$vp9crf = if ($RateScale -gt 1) { 30 } else { 34 }
$x264crf = if ($RateScale -gt 1) { 23 } else { 26 }
$selected = $all | Where-Object { $Renditions -contains $_.name }
foreach ($r in $selected) {
  $o = Join-Path $OutDir "hero-$($r.name)"
  $rateNum = [int]([int]($r.rate -replace "k", "") * $RateScale)
  $r.rate = "$($rateNum)k"
  $buf = "$($rateNum * 2)k"
  Write-Host "  hero-$($r.name).webm" -ForegroundColor Gray
  & ffmpeg -hide_banner -loglevel error -y -i $master -vf "$($r.vf),format=yuv420p" -an `
    -c:v libvpx-vp9 -crf $vp9crf -b:v $r.rate -deadline good -cpu-used 2 -row-mt 1 -tile-columns 2 -g 90 `
    "$o.webm"
  if ($LASTEXITCODE) { throw "webm $($r.name) failed" }

  Write-Host "  hero-$($r.name).mp4" -ForegroundColor Gray
  & ffmpeg -hide_banner -loglevel error -y -i $master -vf "$($r.vf),format=yuv420p" -an `
    -c:v libx264 -preset slow -profile:v high -crf $x264crf -maxrate $r.rate -bufsize $buf -g 90 `
    -movflags +faststart "$o.mp4"
  if ($LASTEXITCODE) { throw "mp4 $($r.name) failed" }
}

# ---- 3. Poster (frame 1 of the loop) ----
& ffmpeg -hide_banner -loglevel error -y -i $master -frames:v 1 -vf "scale=$($PosterSize):force_original_aspect_ratio=increase,crop=$($PosterSize)" -q:v 4 (Join-Path $OutDir $PosterName)
Remove-Item $master -ErrorAction SilentlyContinue

Write-Host "`nDone:" -ForegroundColor Green
Get-ChildItem $OutDir -Filter "hero-*" | Sort-Object Name |
  Format-Table Name, @{ n = "Size"; e = { "{0:N0} KB" -f ($_.Length / 1KB) } } -AutoSize
