#Requires -Version 5.1
<#
.SYNOPSIS
  Build 03 Scenario Matrix: Scenario -> Grade -> Model from 01 + Datasheet-Product/scenario.
#>
param(
  [switch]$Apply,
  [string]$FileIndexRoot = 'G:\My Drive\Longi\File Index',
  [string]$LogDir = "$env:TEMP\longi-scenario-matrix"
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$DryRun = -not $Apply

$d01 = (Get-ChildItem -LiteralPath $FileIndexRoot -Directory | Where-Object { $_.Name -like '01-*' } | Select-Object -First 1).FullName
$d03 = (Get-ChildItem -LiteralPath $FileIndexRoot -Directory | Where-Object { $_.Name -like '03-*' } | Select-Object -First 1).FullName
$scRoot = Join-Path $FileIndexRoot 'Datasheet-Product\scenario'
$segRoot = Join-Path $d01 'Product-Segments'

if (-not $d01) { throw '01 not found' }
if (-not $d03) { throw '03 not found' }

function Test-SkipName([string]$name) {
  return ($name -eq 'desktop.ini' -or $name -like '_*-report*' -or $name -like '_*-map*' -or $name -like '_file-matrix*' -or $name -like '_cert-rename*' -or $name -like '_scenario*')
}

function Ensure-Dir([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
}

function Get-ModelDirs {
  Get-ChildItem -LiteralPath $segRoot -Directory | Sort-Object Name
}

function Test-IsStandardModel([string]$model) {
  if ($model -eq 'LR7-54HVDT') { return $true }
  if ($model -notmatch '^LR7-') { return $false }
  # exactly HVH or HVD at end (no 4th letter)
  return ($model -match 'HVH$' -or $model -match 'HVD$')
}

function Get-HailGrade([string]$fileName) {
  if ($fileName -match 'HW4') { return 'HW4_Glass3.2+2' }
  if ($fileName -match '65mm_Angle60' -or $fileName -match '65mm.*Angle60') { return 'HI65_Angle60_Glass2.8+2' }
  if ($fileName -match '55mm_Angle30_Glass3\.2') { return 'HI55_Angle30_Glass3.2+2' }
  if ($fileName -match '55mm_Angle30_Glass2\.8') { return 'HI55_Angle30_Glass2.8+2' }
  if ($fileName -match '45mm_Glass2\.8' -or ($fileName -match '45mm' -and $fileName -match 'LR8-66HYD')) { return 'HI45_Glass2.8+2' }
  if ($fileName -match '35\+45') { return 'HI35+45' }
  if ($fileName -match '25mm') { return $null } # excluded
  return 'Other-Enhanced'
}

function Get-AntiGlareGrade([string]$fileName, [string]$relHint = '') {
  if ($fileName -match '2\.0|Pro_EcoLife|BRDF' -or $relHint -match '2\.0') { return '2.0' }
  if ($fileName -match '1\.0|Guardian|Antiglare|Antigalre' -or $relHint -match '1\.0') { return '1.0' }
  if ($fileName -match 'Guardian') { return '1.0' }
  return '1.0'
}

function Get-ModelsMentionedInCertName([string]$fileName) {
  $list = New-Object System.Collections.Generic.List[string]
  foreach ($m in [regex]::Matches($fileName, 'LR\d+-\d+[A-Z]+')) {
    if (-not $list.Contains($m.Value)) { $list.Add($m.Value) }
  }
  # Compact multi-model hail naming
  if ($fileName -match '54HVB\+54HVBB\+54HVD\+72HVDF' -or $fileName -match '54HVB\+54HVD\+72HVDF') {
    foreach ($m in @('LR7-54HVB', 'LR7-54HVBB', 'LR7-54HVD', 'LR7-72HVDF')) {
      if (-not $list.Contains($m)) { $list.Add($m) }
    }
  }
  return @($list)
}

# Strict: if filename names specific model(s), only those models may receive it.
# HVH ≠ HVHF / HVD ≠ HVDF / HVD ≠ HVDT. Universal glass certs (no LR* in name) still allowed.
function Test-CertBelongsToModel([string]$fileName, [string]$model) {
  $mentioned = @(Get-ModelsMentionedInCertName $fileName)
  if ($mentioned.Count -eq 0) { return $true }
  return ($mentioned -contains $model)
}

$ops = New-Object System.Collections.Generic.List[object]

function Add-Copy($scenario, $grade, $model, $sub, $src, $destName) {
  if (-not (Test-Path -LiteralPath $src)) { return }
  if (Test-SkipName ([IO.Path]::GetFileName($src))) { return }
  # Certificate (and scenario AntiGlare datasheets used as cert evidence) must strictly match model
  if ($sub -eq 'Certificate' -or ($sub -eq 'Datasheet' -and $scenario -eq '4. AntiGlare' -and ([IO.Path]::GetFileName($src) -match 'AntiGlare|Antiglare|Antigalre'))) {
    if (-not (Test-CertBelongsToModel ([IO.Path]::GetFileName($src)) $model)) { return }
  }
  $destDir = Join-Path $d03 (Join-Path $scenario (Join-Path $grade (Join-Path $model $sub)))
  $dest = Join-Path $destDir $(if ($destName) { $destName } else { [IO.Path]::GetFileName($src) })
  $ops.Add([PSCustomObject]@{
    Scenario = $scenario
    Grade    = $grade
    Model    = $model
    Sub      = $sub
    Source   = $src
    Dest     = $dest
  })
}

function Add-ModelBasics($scenario, $grade, $model) {
  $modelRoot = Join-Path $segRoot $model
  if (-not (Test-Path -LiteralPath $modelRoot)) { return }

  $packs = @(
    @{ SrcName = '1. Datasheet'; Sub = 'Datasheet'; Recurse = $false },
    @{ SrcName = '3. IM'; Sub = 'IM'; Recurse = $false },
    @{ SrcName = '5. Photo'; Sub = 'Photo'; Recurse = $false }
  )
  foreach ($pack in $packs) {
    $srcDir = Join-Path $modelRoot $pack.SrcName
    if (-not (Test-Path -LiteralPath $srcDir)) { continue }
    Get-ChildItem -LiteralPath $srcDir -File -Force -EA SilentlyContinue |
      Where-Object { -not (Test-SkipName $_.Name) } |
      ForEach-Object { Add-Copy $scenario $grade $model $pack.Sub $_.FullName $null }
  }

  # Warranty (either casing)
  foreach ($wName in @('6. warranty', '6. Warranty')) {
    $wDir = Join-Path $modelRoot $wName
    if (-not (Test-Path -LiteralPath $wDir)) { continue }
    Get-ChildItem -LiteralPath $wDir -File -Force -EA SilentlyContinue |
      Where-Object { -not (Test-SkipName $_.Name) } |
      ForEach-Object { Add-Copy $scenario $grade $model 'Warranty' $_.FullName $null }
    break
  }

  # Panfile: keep relative structure (Longi Superior / General / ...)
  $panDir = Join-Path $modelRoot '4. Panfile'
  if (Test-Path -LiteralPath $panDir) {
    Get-ChildItem -LiteralPath $panDir -Recurse -File -Force -EA SilentlyContinue |
      Where-Object { -not (Test-SkipName $_.Name) } |
      ForEach-Object {
        $rel = $_.FullName.Substring($panDir.Length).TrimStart('\')
        $destRelDir = Split-Path $rel -Parent
        $sub = if ($destRelDir) { Join-Path 'Panfile' $destRelDir } else { 'Panfile' }
        Add-Copy $scenario $grade $model $sub $_.FullName ([IO.Path]::GetFileName($rel))
      }
  }
}

$modelDirs = @(Get-ModelDirs)

foreach ($md in $modelDirs) {
  $model = $md.Name
  $dsDir = Join-Path $md.FullName '1. Datasheet'
  $certRoot = Join-Path $md.FullName '2. Certificate'

  # --- 1. Standard ---
  if (Test-IsStandardModel $model) {
    Get-ChildItem -LiteralPath $dsDir -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      Add-Copy '1. Standard' '_base' $model 'Datasheet' $_.FullName $null
    }
    $iec = Join-Path $certRoot 'IEC61215+61730_2023'
    if (Test-Path $iec) {
      Get-ChildItem -LiteralPath $iec -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
        Add-Copy '1. Standard' '_base' $model 'Certificate' $_.FullName $null
      }
    }
  }

  # --- 2. Lightweight ---
  if ($model -match 'HVHL$') {
    Get-ChildItem -LiteralPath $dsDir -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      Add-Copy '2. Lightweight' '_base' $model 'Datasheet' $_.FullName $null
    }
    $iec = Join-Path $certRoot 'IEC61215+61730_2023'
    if (Test-Path $iec) {
      Get-ChildItem -LiteralPath $iec -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
        Add-Copy '2. Lightweight' '_base' $model 'Certificate' $_.FullName $null
      }
    }
  }

  # --- 3. Premium-AllBlack ---
  if ($model -match 'HVB$' -and $model -notmatch 'HVBB') {
    Get-ChildItem -LiteralPath $dsDir -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      Add-Copy '3. Premium-AllBlack' '_base' $model 'Datasheet' $_.FullName $null
    }
    $ag = Join-Path $certRoot 'AntiGlare'
    if (Test-Path $ag) {
      Get-ChildItem -LiteralPath $ag -File -Force -EA SilentlyContinue | Where-Object { $_.Name -match 'Pro|EcoLife|HVB' -and -not (Test-SkipName $_.Name) } | ForEach-Object {
        Add-Copy '3. Premium-AllBlack' '_base' $model 'Certificate' $_.FullName $null
      }
    }
  }

  # --- 4. AntiGlare from 01 ---
  $agDir = Join-Path $certRoot 'AntiGlare'
  if (Test-Path $agDir) {
    Get-ChildItem -LiteralPath $agDir -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      $grade = Get-AntiGlareGrade $_.Name
      Add-Copy '4. AntiGlare' $grade $model 'Certificate' $_.FullName $null
    }
  }

  # --- 5. AntiDust ---
  $dust = Join-Path $certRoot 'DustSand'
  if (Test-Path $dust) {
    Get-ChildItem -LiteralPath $dust -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      Add-Copy '5. AntiDust' 'Certified' $model 'Certificate' $_.FullName $null
    }
  }

  # --- 6. Hail enhanced only ---
  $hail = Join-Path $certRoot 'Hail'
  if (Test-Path $hail) {
    Get-ChildItem -LiteralPath $hail -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      $grade = Get-HailGrade $_.Name
      if ($grade) {
        Add-Copy '6. Hail' $grade $model 'Certificate' $_.FullName $null
      }
    }
  }

  # --- 7. Marine: only L8+ (not L1/L6 universal) ---
  $salt = Join-Path $certRoot 'SaltMist-IEC61701'
  if (Test-Path $salt) {
    Get-ChildItem -LiteralPath $salt -File -Force -EA SilentlyContinue | Where-Object {
      -not (Test-SkipName $_.Name) -and
      $_.Name -match 'L8' -and
      $_.Name -notmatch 'L1\+L6|_L1_|_L6_|Seaside'
    } | ForEach-Object {
      Add-Copy '7. Marine' 'SaltMist-L8' $model 'Certificate' $_.FullName $null
    }
  }

  # --- 8. Fire ---
  $fire = Join-Path $certRoot 'Fire'
  if (Test-Path $fire) {
    Get-ChildItem -LiteralPath $fire -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      Add-Copy '8. Fire-ClassA' 'ClassA' $model 'Certificate' $_.FullName $null
    }
  }

  # --- 9. Agri-Ammonia ---
  $am = Join-Path $certRoot 'Ammonia-IEC62716'
  if (Test-Path $am) {
    Get-ChildItem -LiteralPath $am -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      Add-Copy '9. Agri-Ammonia' 'Certified' $model 'Certificate' $_.FullName $null
    }
  }

  # --- 10. HighWind ---
  $wind = Join-Path $certRoot 'Wind'
  if (Test-Path $wind) {
    Get-ChildItem -LiteralPath $wind -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
      Add-Copy '10. HighWind' 'Albright' $model 'Certificate' $_.FullName $null
    }
  }
}

# --- scenario Anti-glare datasheets ---
$agSc = Join-Path $scRoot 'Anti-glare'
if (Test-Path $agSc) {
  Get-ChildItem -LiteralPath $agSc -Recurse -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
    $rel = $_.FullName.Substring($agSc.Length).TrimStart('\')
    $grade = if ($rel -match '^2\.0\\' -or $rel -match '\\2\.0\\') { '2.0' } elseif ($rel -match '^1\.0\\' -or $rel -match '\\1\.0\\') { '1.0' } else { Get-AntiGlareGrade $_.Name $rel }
    $model = $null
    if ($_.Name -match '(LR\d+[-_]\d+[A-Z]+)') {
      $model = $Matches[1] -replace '_', '-'
    }
    if (-not $model -and $_.Name -match 'LR7[_-]54HVB') { $model = 'LR7-54HVB' }
    if (-not $model -and $_.Name -match 'LR7[_-]54HVH') { $model = 'LR7-54HVH' }
    if (-not $model -and $_.Name -match 'LR7[_-]72HVD') { $model = 'LR7-72HVD' }
    if (-not $model -and $_.Name -match 'LR7[_-]72HVH') { $model = 'LR7-72HVH' }
    if (-not $model -and $_.Name -match 'LR8[_-]66HVD') { $model = 'LR8-66HVD' }
    if ($model) {
      Add-Copy '4. AntiGlare' $grade $model 'Datasheet' $_.FullName $null
    }
  }
}

# --- Sea-shield Floating ---
$sea = Join-Path $scRoot 'Sea-shield Floating'
if (Test-Path $sea) {
  Get-ChildItem -LiteralPath $sea -Recurse -File -Force -EA SilentlyContinue | Where-Object {
    -not (Test-SkipName $_.Name) -and $_.Extension -match '\.(pdf|pptx|png|rar)$'
  } | ForEach-Object {
    $model = 'LR8-66HYD'
    if ($_.Name -match 'LR7-72HGD|himo7') { $model = 'LR7-72HGD' }
    if ($_.Name -match 'LR8-66HYD|himo9|Sea-shield|Sea shield') { $model = 'LR8-66HYD' }
    $sub = if ($_.Extension -match '\.(pptx|png|rar)$' -or $_.Name -match 'introduction|Anchor|Ventures|Deep Blue|0610') { 'Intro' } else { 'Datasheet' }
    # salt mist / certs from sea-shield folder go to Certificate
    if ($_.Name -match 'TRF|CERT|盐雾|Salt|CBC') { $sub = 'Certificate' }
    Add-Copy '7. Marine' 'SeaShield-Floating' $model $sub $_.FullName $null
  }
}

# Ice-Shield datasheet -> Hail HW4 grade for HYD
$ice = Join-Path $scRoot 'Ice-Shield'
if (Test-Path $ice) {
  Get-ChildItem -LiteralPath $ice -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipName $_.Name) } | ForEach-Object {
    Add-Copy '6. Hail' 'HW4_Glass3.2+2' 'LR8-66HYD' 'Datasheet' $_.FullName $null
  }
}

# For every Scenario/Grade/Model leaf, attach basics from 01 (Datasheet/IM/Panfile/Warranty/Photo)
$placements = $ops | Select-Object Scenario, Grade, Model -Unique
$basicBefore = $ops.Count
foreach ($p in $placements) {
  Add-ModelBasics $p.Scenario $p.Grade $p.Model
}
Write-Host "BASICS_ADDED_OPS=$(($ops.Count - $basicBefore)) for placements=$($placements.Count)"

# Deduplicate by Dest
$unique = [System.Collections.Generic.List[object]]::new()
$seen = @{}
foreach ($op in $ops) {
  $key = $op.Dest.ToLowerInvariant()
  if ($seen.ContainsKey($key)) { continue }
  $seen[$key] = $true
  $unique.Add($op)
}
$ops = $unique

$mapPath = Join-Path $LogDir 'scenario-copy-map.csv'
$ops | Export-Csv -LiteralPath $mapPath -NoTypeInformation -Encoding UTF8
Write-Host "D01=$d01"
Write-Host "D03=$d03"
Write-Host "OPS=$($ops.Count) DRYRUN=$DryRun"
$ops | Group-Object Scenario | Sort-Object Name | ForEach-Object { "SCENARIO $($_.Name) = $($_.Count)" }

if ($DryRun) {
  Write-Host 'Dry run only. Re-run with -Apply.'
  exit 0
}

# Clear previous scenario content under 03 (keep root reports)
Get-ChildItem -LiteralPath $d03 -Force | Where-Object {
  $_.Name -ne 'desktop.ini' -and $_.Name -notlike '_scenario*'
} | ForEach-Object {
  Remove-Item -LiteralPath $_.FullName -Recurse -Force
  Write-Host "Removed $($_.Name)"
}

$results = New-Object System.Collections.Generic.List[object]
$i = 0
foreach ($op in $ops) {
  $i++
  try {
    Ensure-Dir (Split-Path $op.Dest -Parent)
    Copy-Item -LiteralPath $op.Source -Destination $op.Dest -Force
    $results.Add([PSCustomObject]@{ Status = 'OK'; Scenario = $op.Scenario; Grade = $op.Grade; Model = $op.Model; Dest = $op.Dest })
  }
  catch {
    $results.Add([PSCustomObject]@{ Status = "ERR:$($_.Exception.Message)"; Scenario = $op.Scenario; Grade = $op.Grade; Model = $op.Model; Dest = $op.Dest })
  }
  if (($i % 40) -eq 0) { Write-Host "copied $i / $($ops.Count)" }
}

$resultPath = Join-Path $LogDir 'scenario-copy-results.csv'
$results | Export-Csv -LiteralPath $resultPath -NoTypeInformation -Encoding UTF8
$ok = @($results | Where-Object Status -eq 'OK').Count
$err = @($results | Where-Object { $_.Status -like 'ERR*' }).Count
Write-Host "COPY_DONE ok=$ok err=$err"

# Report
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('Scenario-matrix build report (Scenario -> Grade -> Model)')
[void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$sb.AppendLine("Source01: $d01")
[void]$sb.AppendLine("Dest03:   $d03")
[void]$sb.AppendLine("CopiedOK=$ok Errors=$err")
[void]$sb.AppendLine('Rules: Standard=HVH/HVD+LR7-54HVDT; Marine excludes universal SaltMist L1/L6; Hail enhanced only')
[void]$sb.AppendLine('Each model leaf also includes basics from 01: Datasheet, IM, Panfile, Warranty, Photo')
[void]$sb.AppendLine('')

Get-ChildItem -LiteralPath $d03 -Directory | Sort-Object Name | ForEach-Object {
  $scName = $_.Name
  $files = @(Get-ChildItem -LiteralPath $_.FullName -Recurse -File -Force | Where-Object { -not (Test-SkipName $_.Name) })
  [void]$sb.AppendLine("==== $scName ==== files=$($files.Count)")
  Get-ChildItem -LiteralPath $_.FullName -Directory | Sort-Object Name | ForEach-Object {
    $grade = $_.Name
    $gFiles = @(Get-ChildItem -LiteralPath $_.FullName -Recurse -File -Force | Where-Object { -not (Test-SkipName $_.Name) })
    $models = @(Get-ChildItem -LiteralPath $_.FullName -Directory | ForEach-Object { $_.Name })
    [void]$sb.AppendLine("  $grade : files=$($gFiles.Count) models=$($models -join ', ')")
    Get-ChildItem -LiteralPath $_.FullName -Directory | Sort-Object Name | ForEach-Object {
      $subs = @(Get-ChildItem -LiteralPath $_.FullName -Directory | ForEach-Object { $_.Name })
      [void]$sb.AppendLine("    $($_.Name) subs=$($subs -join ', ')")
    }
  }
  [void]$sb.AppendLine('')
}

$reportPath = Join-Path $d03 '_scenario-matrix-build-report.txt'
[System.IO.File]::WriteAllText($reportPath, $sb.ToString(), [System.Text.UTF8Encoding]::new($true))
Copy-Item $mapPath (Join-Path $d03 '_scenario-matrix-copy-map.csv') -Force
Copy-Item $resultPath (Join-Path $d03 '_scenario-matrix-copy-results.csv') -Force
Write-Host "REPORT=$reportPath"
