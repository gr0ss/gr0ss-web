<#
  processArt.ps1 - turn the raw art in art-src/ into web-sized assets under
  assets-src/img/.

  Uses .NET System.Drawing only (ships with Windows) so the repo stays
  dependency-free. Run from the repo root:

      powershell -ExecutionPolicy Bypass -File scripts/processArt.ps1

  Sources are NOT committed - art-src/ is gitignored - and the optimized output
  IS committed, so a static host needs no build step.

  To rebuild art-src/ from scratch (game repo: D:\Projects\Unity\PoisonHotDogs\PoisonHotDogs):

  - art-src/outfits/*.png are the game's own full-body outfit paintings - 
    Assets/Resources/ShopItems/<name>.png, the exact sprite the game draws on
    Rexy in play and on the My Crew pedestal. One file per outfit, named as the
    game names them (see $outfitNames below for the web name of each).
  - art-src/mode-tiles/*.png are the Pick a Game tiles - 
    Assets/Resources/ModeTiles/tile_<mode>.png.
  - art-src/generated/*.png are the three pieces that have NO game source:
    the horizontal header lockup, the outfit-stage pedestal, and the stage
    backdrop. They were produced in the 2026-09 site redesign (ChatGPT image
    generation in the style of the game's menu_Banner.png) and arrived only as
    finished PNGs; the copies here are the originals from that hand-off.
  - art-src/screenshots/*.png are frames from the game's own Play Mode QA sweep
    (VerifyShots/ in the game repo, gitignored there - the same sweep the Play
    listing screenshots are cut from). Current set = the 2026-09-07 sweep at
    v1.0.0. The one frame the site still uses:

      04_boss_sneeze_machine       <- VerifyShots/40_boss_targets_clear.png

    (The other seven frames of that sweep are still in art-src/ but the site no
    longer uses them; the carousel now runs on the capture-*-v2.webp set.)
  - assets-src/img/capture-*-v2.webp (the six carousel frames) are NOT produced
    by this script. They are 2048x955 phone-aspect captures off a Unity
    DEVELOPMENT build, delivered as finished WebP in the 2026-09 redesign
    hand-off; the originals are kept in art-src/captures-devbuild/. Every one
    carried Unity's "Development Build" watermark in the bottom-right corner,
    so the committed copies are the same frames with the bottom 22px cropped
    (2048x933) - GDI+ cannot decode WebP, so that crop was done in a browser
    canvas, not here. The clean fix is a recapture from a release build; when
    that happens, drop the new frames straight into assets-src/img/.
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

# Resize preserving aspect ratio. Give either -TargetWidth (exact width) or
# -MaxSize (fit inside a MaxSize x MaxSize box, never upscaling). Writes JPEG
# (opaque, flattened on navy) or PNG (alpha preserved) depending on -Format.
function Convert-Image {
    param(
        [Parameter(Mandatory)][string] $InputPath,
        [Parameter(Mandatory)][string] $OutputPath,
        [int]    $TargetWidth = 0,
        [int]    $MaxSize = 0,
        [ValidateSet('jpeg', 'png')][string] $Format = 'jpeg',
        [int] $Quality = 82
    )

    $source = [System.Drawing.Image]::FromFile($InputPath)
    try {
        if ($MaxSize -gt 0) {
            $scale = [Math]::Min(1.0, [Math]::Min($MaxSize / $source.Width, $MaxSize / $source.Height))
        } elseif ($TargetWidth -gt 0) {
            $scale = $TargetWidth / $source.Width
        } else {
            throw 'Convert-Image needs -TargetWidth or -MaxSize.'
        }
        $width        = [int][Math]::Round($source.Width * $scale)
        $targetHeight = [int][Math]::Round($source.Height * $scale)
        $bitmap       = New-Object System.Drawing.Bitmap($width, $targetHeight)
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

                $graphics.DrawImage($source, 0, 0, $width, $targetHeight)
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
    Write-Host ("  {0,-36} {1,4}x{2,-4} px  {3,8} KB" -f (Split-Path -Leaf $OutputPath), $width, $targetHeight, $sizeKb)
}

# The 15 Rexy outfits, in the game's shop order, keyed by the game's own sprite
# name. Two web sizes each: 512px for the pedestal stage, 160px for the picker
# rail (rendered at ~80px, so 2x).
Write-Host 'Outfit art -> assets-src/img/outfit-art-*.png (512px) and outfit-thumb-*.png (160px)'
$outfitNames = [ordered]@{
    'sunglasses'     = '01-cool-shades'
    'scarf'          = '02-adventurer'
    'backpack'       = '03-backpacker'
    'floaties'       = '04-pool-floaties'
    'hockey_mask'    = '05-hockey-star'
    'snorkel'        = '06-snorkeler'
    'chef'           = '07-chef'
    'skateboardPunk' = '08-skater-punk'
    'christmas'      = '09-santa-dino'
    'pirate'         = '10-pirate'
    'astronaut'      = '11-astronaut'
    'scientist'      = '12-scientist'
    'ninja'          = '13-ninja'
    'knight'         = '14-knight'
    'superhero_cape' = '15-superhero'
}
foreach ($entry in $outfitNames.GetEnumerator()) {
    $in = Join-Path $srcDir "outfits\$($entry.Key).png"
    if (-not (Test-Path $in)) { throw "Missing outfit source '$in' (copy it from the game repo's Assets/Resources/ShopItems/)." }
    Convert-Image -InputPath $in -OutputPath (Join-Path $outDir "outfit-art-$($entry.Value).png")   -MaxSize 512 -Format png
    Convert-Image -InputPath $in -OutputPath (Join-Path $outDir "outfit-thumb-$($entry.Value).png") -MaxSize 160 -Format png
}

# The four Pick a Game tiles (opaque 3:2 paintings), 1024px wide JPEG.
Write-Host 'Mode tiles -> assets-src/img/mode-art-*.jpg (1024px wide JPEG)'
$modeNames = [ordered]@{
    'tile_story'     = 'rotten-rescue'
    'tile_freestyle' = 'snack-attack'
    'tile_abc'       = 'abcs'
    'tile_123'       = '123s'
}
foreach ($entry in $modeNames.GetEnumerator()) {
    $in = Join-Path $srcDir "mode-tiles\$($entry.Key).png"
    if (-not (Test-Path $in)) { throw "Missing mode tile '$in' (copy it from the game repo's Assets/Resources/ModeTiles/)." }
    Convert-Image -InputPath $in -OutputPath (Join-Path $outDir "mode-art-$($entry.Value).jpg") -TargetWidth 1024 -Format jpeg -Quality 84
}

# The generated pieces. The header lockup renders at most ~340px wide, so
# 1200px is plenty for 3x screens; the pedestal sits under a ~400px figure.
Write-Host 'Generated pieces -> assets-src/img/'
Convert-Image -InputPath (Join-Path $srcDir 'generated\phd-header-lockup-v2.png') `
              -OutputPath (Join-Path $outDir 'phd-header-lockup-v2.png') -TargetWidth 1200 -Format png
Convert-Image -InputPath (Join-Path $srcDir 'generated\outfit-pedestal-v2.png') `
              -OutputPath (Join-Path $outDir 'outfit-pedestal-v2.png') -TargetWidth 900 -Format png
Convert-Image -InputPath (Join-Path $srcDir 'generated\outfit-stage-backdrop-v2.png') `
              -OutputPath (Join-Path $outDir 'outfit-stage-backdrop-v2.jpg') -TargetWidth 1400 -Format jpeg -Quality 80

# The one Play Mode QA capture still in use (the boss card), 540px wide JPEG.
Write-Host 'Screenshots -> assets-src/img/shot-04-boss-sneeze-machine.jpg (540px wide JPEG)'
Convert-Image -InputPath (Join-Path $srcDir 'screenshots\04_boss_sneeze_machine.png') `
              -OutputPath (Join-Path $outDir 'shot-04-boss-sneeze-machine.jpg') -TargetWidth 540 -Format jpeg -Quality 82

Write-Host 'Done.'
