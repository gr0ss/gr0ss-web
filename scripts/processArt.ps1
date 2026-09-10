<#
  processArt.ps1 — turn the raw Play Store art in art-src/ into web-sized assets
  under assets-src/img/.

  Uses .NET System.Drawing only (ships with Windows) so the repo stays
  dependency-free. Run from the repo root:

      powershell -ExecutionPolicy Bypass -File scripts/processArt.ps1

  Sources are NOT committed — art-src/ is gitignored — and the optimized output
  IS committed, so a static host needs no build step.

  To rebuild art-src/ from scratch (game repo: D:\Projects\Unity\PoisonHotDogs\PoisonHotDogs):

  - art-src/store/feature-graphic-splash.png is
    docs/PlayStore/listing-assets/feature-graphic/feature-graphic-splash.png on main.
  - art-src/screenshots/*.png are frames from the game's own Play Mode QA sweep
    (VerifyShots/ in the game repo, gitignored there — the same sweep the Play
    listing screenshots are cut from). Current set = the 2026-09-07 sweep at
    v1.0.0, captured two days before the 2026-09-09 main tip. Source frames:

      01_title_splash              <- VerifyShots/44_splash.png
      02_pick_a_game               <- VerifyShots/02_mode_select.png
      03_rotten_rescue_condiments  <- VerifyShots/76_level74_play_1920x1080.png
      04_boss_sneeze_machine       <- VerifyShots/40_boss_targets_clear.png
      05_abc_gameplay              <- VerifyShots/20_parade_telegraph.png
      06_world_map_stars           <- VerifyShots/33_world_mastered_celebration.png
      07_rescued_buddy             <- VerifyShots/43_rescue_celebration.png
      08_daily_treat               <- VerifyShots/41c_daily_treat_flame_lit.png

    These are real screens of the game running (1920x1080, phone aspect), not
    mockups — but they are editor Play Mode captures, not captures off a phone.
    Re-cut them whenever the player-facing UI changes; the game repo's
    report_stale_listing_assets.ps1 flags when the listing set has gone stale.
#>

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$srcDir   = Join-Path $repoRoot 'art-src'
$outDir   = Join-Path $repoRoot 'assets-src\img'

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

function Get-JpegEncoder {
    [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq 'image/jpeg' }
}

# Resize preserving aspect ratio. Writes JPEG (opaque, flattened on navy) or
# PNG (alpha preserved) depending on -Format.
function Convert-Image {
    param(
        [Parameter(Mandatory)][string] $InputPath,
        [Parameter(Mandatory)][string] $OutputPath,
        [Parameter(Mandatory)][int]    $TargetWidth,
        [ValidateSet('jpeg', 'png')][string] $Format = 'jpeg',
        [int] $Quality = 82
    )

    $source = [System.Drawing.Image]::FromFile($InputPath)
    try {
        $scale        = $TargetWidth / $source.Width
        $targetHeight = [int][Math]::Round($source.Height * $scale)
        $bitmap       = New-Object System.Drawing.Bitmap($TargetWidth, $targetHeight)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

                # JPEG has no alpha; flat-fill with the brand navy so any
                # transparent edge blends into the site background instead of
                # going black.
                if ($Format -eq 'jpeg') {
                    $brandNavy = [System.Drawing.ColorTranslator]::FromHtml('#0E1B33')
                    $graphics.Clear($brandNavy)
                }

                $graphics.DrawImage($source, 0, 0, $TargetWidth, $targetHeight)
            } finally { $graphics.Dispose() }

            if ($Format -eq 'jpeg') {
                $encoder    = Get-JpegEncoder
                $params     = New-Object System.Drawing.Imaging.EncoderParameters(1)
                $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                    [System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
                $bitmap.Save($OutputPath, $encoder, $params)
                $params.Dispose()
            } else {
                $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            }
        } finally { $bitmap.Dispose() }
    } finally { $source.Dispose() }

    $sizeKb = [Math]::Round((Get-Item $OutputPath).Length / 1KB, 1)
    Write-Host ("  {0,-34} {1,5} px wide  {2,8} KB" -f (Split-Path -Leaf $OutputPath), $TargetWidth, $sizeKb)
}

# The eight real in-game captures, in gallery order. These are genuine
# screenshots of the game running, not placeholders — 540px is 2x the ~270px
# column the gallery renders them at on a phone.
Write-Host 'Screenshots -> assets-src/img/shot-*.jpg (540px wide JPEG)'
$shotNames = @{
    '01_title_splash'             = 'shot-01-title-splash'
    '02_pick_a_game'              = 'shot-02-pick-a-game'
    '03_rotten_rescue_condiments' = 'shot-03-rotten-rescue-condiments'
    '04_boss_sneeze_machine'      = 'shot-04-boss-sneeze-machine'
    '05_abc_gameplay'             = 'shot-05-abc-gameplay'
    '06_world_map_stars'          = 'shot-06-world-map-stars'
    '07_rescued_buddy'            = 'shot-07-rescued-buddy'
    '08_daily_treat'              = 'shot-08-daily-treat'
}
Get-ChildItem (Join-Path $srcDir 'screenshots\*.png') | Sort-Object Name | ForEach-Object {
    $webName = $shotNames[$_.BaseName]
    if (-not $webName) { throw "No web filename mapped for screenshot '$($_.BaseName)'." }
    $out = Join-Path $outDir "$webName.jpg"
    Convert-Image -InputPath $_.FullName -OutputPath $out -TargetWidth 540 -Format jpeg -Quality 82
}

# The Play feature graphic doubles as the game site's wide hero image.
Write-Host 'Hero art -> assets-src/img/'
Convert-Image -InputPath (Join-Path $srcDir 'store\feature-graphic-splash.png') `
              -OutputPath (Join-Path $outDir 'phd-hero-wide.jpg') -TargetWidth 1024 -Format jpeg -Quality 86

Write-Host 'Done.'
