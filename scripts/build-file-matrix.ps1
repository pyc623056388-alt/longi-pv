#Requires -Version 5.1
<#
.SYNOPSIS
  Build 02-文件矩阵 from 01-产品矩阵 as Type -> (subtype) -> files (no model folders).
.PARAMETER Apply
  Actually clear type dirs and copy. Without -Apply, dry-run only.
.PARAMETER RebuildTypes
  When applying, remove existing 1..6 type folders under 02 before copy (default on with -Apply).
#>
param(
  [switch]$Apply,
  [switch]$NoRebuild,
  [string]$FileIndexRoot = 'G:\My Drive\Longi\File Index',
  [string]$LogDir = "$env:TEMP\longi-file-matrix"
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$DryRun = -not $Apply
$RebuildTypes = $Apply -and (-not $NoRebuild)

$d01 = (Get-ChildItem -LiteralPath $FileIndexRoot -Directory | Where-Object { $_.Name -like '01-*' } | Select-Object -First 1).FullName
$d02 = (Get-ChildItem -LiteralPath $FileIndexRoot -Directory | Where-Object { $_.Name -like '02-*' } | Select-Object -First 1).FullName

if (-not $d01) { throw "01 product matrix folder not found under $FileIndexRoot" }
if (-not $d02) { throw "02 file matrix folder not found under $FileIndexRoot" }

$segRoot = Join-Path $d01 'Product-Segments'
$genSrc = Join-Path $d01 'General'

$typeRoots = @(
  '1. Datasheet',
  '2. Certificate',
  '3. IM',
  '4. Panfile',
  '5. Photo',
  '6. Warranty'
)

function Get-DestTypeName([string]$srcType) {
  switch -Regex ($srcType) {
    '^1\.\s*Datasheet$' { return '1. Datasheet' }
    '^2\.\s*Certificate$' { return '2. Certificate' }
    '^3\.\s*IM$' { return '3. IM' }
    '^4\.\s*Panfile$' { return '4. Panfile' }
    '^5\.\s*Photo$' { return '5. Photo' }
    '^6\.\s*warranty$' { return '6. Warranty' }
    default { return $null }
  }
}

function Test-SkipFile([string]$name) {
  if ($name -eq 'desktop.ini') { return $true }
  if ($name -like '_cert-rename-*') { return $true }
  if ($name -like '_gap-report*') { return $true }
  if ($name -like '_build-report*') { return $true }
  if ($name -like '_file-matrix-*') { return $true }
  return $false
}

$candidates = New-Object System.Collections.Generic.List[object]
$models = @(Get-ChildItem -LiteralPath $segRoot -Directory | Sort-Object Name)

foreach ($modelDir in $models) {
  $model = $modelDir.Name
  Get-ChildItem -LiteralPath $modelDir.FullName -Directory | ForEach-Object {
    $dstType = Get-DestTypeName $_.Name
    if (-not $dstType) { return }

    $srcTypePath = $_.FullName
    Get-ChildItem -LiteralPath $srcTypePath -Recurse -File -Force -ErrorAction SilentlyContinue |
      Where-Object { -not (Test-SkipFile $_.Name) } |
      ForEach-Object {
        # Relative under type folder (no model in this path from 01)
        $relUnderType = $_.FullName.Substring($srcTypePath.Length).TrimStart('\')
        # Flat dest: 02\Type\relUnderType  (Certificate keeps Hail\, Panfile keeps Longi Superior\, etc.)
        $dst = Join-Path (Join-Path $d02 $dstType) $relUnderType
        $candidates.Add([PSCustomObject]@{
          Model  = $model
          Type   = $dstType
          Source = $_.FullName
          Dest   = $dst
          Size   = $_.Length
          Rel    = $relUnderType
        })
      }
  }
}

# General: keep structure as-is under 02\General
$genOps = New-Object System.Collections.Generic.List[object]
if (Test-Path -LiteralPath $genSrc) {
  $genDst = Join-Path $d02 'General'
  Get-ChildItem -LiteralPath $genSrc -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object { -not (Test-SkipFile $_.Name) } |
    ForEach-Object {
      $rel = $_.FullName.Substring($genSrc.Length).TrimStart('\')
      $genOps.Add([PSCustomObject]@{
        Model  = 'General'
        Type   = 'General'
        Source = $_.FullName
        Dest   = Join-Path $genDst $rel
        Size   = $_.Length
        Rel    = $rel
        Action = 'Copy'
      })
    }
}

# Dedupe by Dest path: same name+size -> keep one; same name different size -> suffix model
$ops = New-Object System.Collections.Generic.List[object]
$byDest = $candidates | Group-Object { $_.Dest.ToLowerInvariant() }

foreach ($g in $byDest) {
  $items = @($g.Group | Sort-Object Model)
  if ($items.Count -eq 1) {
    $op = $items[0] | Select-Object *, @{n='Action';e={ 'Copy' }}
    $ops.Add([PSCustomObject]@{
      Model = $op.Model; Type = $op.Type; Source = $op.Source; Dest = $op.Dest
      Size = $op.Size; Rel = $op.Rel; Action = 'Copy'
    })
    continue
  }

  $sizeGroups = @($items | Group-Object Size)
  if ($sizeGroups.Count -eq 1) {
    $first = @($items | Sort-Object Model)[0]
    $ops.Add([PSCustomObject]@{
      Model = $first.Model; Type = $first.Type; Source = $first.Source; Dest = $first.Dest
      Size = $first.Size; Rel = $first.Rel
      Action = "Dedupe($($items.Count) models: $(($items.Model | Select-Object -Unique) -join ','))"
    })
  }
  else {
    # Same relative path, different sizes: one file per size group, model-suffixed
    foreach ($sg in $sizeGroups) {
      $first = @($sg.Group | Sort-Object Model)[0]
      $dir = Split-Path $first.Dest -Parent
      $base = [IO.Path]::GetFileNameWithoutExtension($first.Dest)
      $ext = [IO.Path]::GetExtension($first.Dest)
      $newDest = Join-Path $dir "${base}_$($first.Model)$ext"
      $ops.Add([PSCustomObject]@{
        Model = $first.Model; Type = $first.Type; Source = $first.Source; Dest = $newDest
        Size = $first.Size; Rel = $first.Rel
        Action = "CopySuffixed(sizeGroup n=$($sg.Count))"
      })
    }
  }
}

foreach ($g in $genOps) { $ops.Add($g) }

$mapPath = Join-Path $LogDir 'file-matrix-copy-map.csv'
$ops | Export-Csv -LiteralPath $mapPath -NoTypeInformation -Encoding UTF8

$srcCount = $candidates.Count + $genOps.Count
$deduped = @($ops | Where-Object { $_.Action -like 'Dedupe*' }).Count
Write-Host "D01=$d01"
Write-Host "D02=$d02"
Write-Host "MODELS=$($models.Count)"
Write-Host "CANDIDATES=$($candidates.Count) GENERAL=$($genOps.Count) OPS=$($ops.Count) DEDUPE_GROUPS=$deduped"
Write-Host "MAP=$mapPath"
Write-Host "DRYRUN=$DryRun REBUILD=$RebuildTypes"

$ops | Group-Object Type | Sort-Object Name | ForEach-Object {
  Write-Host ("TYPE {0} = {1}" -f $_.Name, $_.Count)
}

if ($DryRun) {
  Write-Host 'Dry run only. Re-run with -Apply to rebuild and copy.'
  exit 0
}

# Clear type roots (not General)
if ($RebuildTypes) {
  foreach ($t in $typeRoots) {
    $p = Join-Path $d02 $t
    if (Test-Path -LiteralPath $p) {
      Write-Host "Removing $t ..."
      Remove-Item -LiteralPath $p -Recurse -Force
    }
  }
}

$results = New-Object System.Collections.Generic.List[object]
$i = 0
foreach ($op in $ops) {
  $i++
  try {
    $destDir = Split-Path $op.Dest -Parent
    if (-not (Test-Path -LiteralPath $destDir)) {
      New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }
    if ((Test-Path -LiteralPath $op.Dest) -and ($op.Action -like 'Dedupe*')) {
      # already written by first of group - skip if exists
      $results.Add([PSCustomObject]@{ Status = 'SkipExists'; Type = $op.Type; Model = $op.Model; Dest = $op.Dest; Action = $op.Action })
    }
    else {
      Copy-Item -LiteralPath $op.Source -Destination $op.Dest -Force
      $results.Add([PSCustomObject]@{ Status = 'OK'; Type = $op.Type; Model = $op.Model; Dest = $op.Dest; Action = $op.Action })
    }
  }
  catch {
    $results.Add([PSCustomObject]@{ Status = "ERR:$($_.Exception.Message)"; Type = $op.Type; Model = $op.Model; Dest = $op.Dest; Action = $op.Action })
  }
  if (($i % 50) -eq 0) { Write-Host "copied $i / $($ops.Count)" }
}

$resultPath = Join-Path $LogDir 'file-matrix-copy-results.csv'
$results | Export-Csv -LiteralPath $resultPath -NoTypeInformation -Encoding UTF8
$ok = @($results | Where-Object { $_.Status -match '^(OK|SkipExists)$' }).Count
$err = @($results | Where-Object { $_.Status -like 'ERR*' }).Count
Write-Host "COPY_DONE ok=$ok err=$err"

# Report
$report = New-Object System.Text.StringBuilder
[void]$report.AppendLine("File-matrix build report (Type -> files, no model folders)")
[void]$report.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$report.AppendLine("Source: $d01")
[void]$report.AppendLine("Dest:   $d02")
[void]$report.AppendLine("SourceCandidates=$($candidates.Count) DestOps(product)=$($ops.Count - $genOps.Count) General=$($genOps.Count)")
[void]$report.AppendLine("CopiedOK=$ok Errors=$err")
[void]$report.AppendLine("")

foreach ($typeName in @($typeRoots + @('General'))) {
  $typePath = Join-Path $d02 $typeName
  if (-not (Test-Path -LiteralPath $typePath)) {
    [void]$report.AppendLine("==== $typeName ==== MISSING")
    continue
  }
  $files = @(Get-ChildItem -LiteralPath $typePath -Recurse -File -Force | Where-Object { -not (Test-SkipFile $_.Name) })
  [void]$report.AppendLine("==== $typeName ==== files=$($files.Count)")

  # Flag any model-named top folders
  $topDirs = @(Get-ChildItem -LiteralPath $typePath -Directory -ErrorAction SilentlyContinue)
  $modelLike = @($topDirs | Where-Object { $_.Name -match '^LR\d' })
  if ($modelLike.Count -gt 0) {
    [void]$report.AppendLine("  WARNING model folders still present: $($modelLike.Name -join ', ')")
  }

  if ($typeName -eq '2. Certificate' -or $typeName -eq '4. Panfile') {
    foreach ($d in ($topDirs | Sort-Object Name)) {
      $n = @(Get-ChildItem -LiteralPath $d.FullName -Recurse -File -Force | Where-Object { -not (Test-SkipFile $_.Name) }).Count
      [void]$report.AppendLine("  $($d.Name)=$n")
    }
  }
  else {
    $files | Sort-Object Name | ForEach-Object { [void]$report.AppendLine("  $($_.Name)") }
  }
  [void]$report.AppendLine("")
}

[void]$report.AppendLine("==== Source vs Dest (after flatten+dedupe) ====")
foreach ($pair in @(
  @{ Src = '1. Datasheet'; Dst = '1. Datasheet' },
  @{ Src = '2. Certificate'; Dst = '2. Certificate' },
  @{ Src = '3. IM'; Dst = '3. IM' },
  @{ Src = '4. Panfile'; Dst = '4. Panfile' },
  @{ Src = '5. Photo'; Dst = '5. Photo' }
)) {
  $srcN = 0
  foreach ($modelDir in $models) {
    $p = Join-Path $modelDir.FullName $pair.Src
    if (Test-Path -LiteralPath $p) {
      $srcN += @(Get-ChildItem -LiteralPath $p -Recurse -File -Force | Where-Object { -not (Test-SkipFile $_.Name) }).Count
    }
  }
  $dstP = Join-Path $d02 $pair.Dst
  $dstN = if (Test-Path -LiteralPath $dstP) {
    @(Get-ChildItem -LiteralPath $dstP -Recurse -File -Force | Where-Object { -not (Test-SkipFile $_.Name) }).Count
  } else { 0 }
  [void]$report.AppendLine("$($pair.Dst): source=$srcN dest=$dstN dedupedApprox=$($srcN - $dstN)")
}

$srcW = 0
foreach ($modelDir in $models) {
  foreach ($w in @('6. warranty', '6. Warranty')) {
    $p = Join-Path $modelDir.FullName $w
    if (Test-Path -LiteralPath $p) {
      $srcW += @(Get-ChildItem -LiteralPath $p -Recurse -File -Force | Where-Object { -not (Test-SkipFile $_.Name) }).Count
      break
    }
  }
}
$dstWN = @(Get-ChildItem -LiteralPath (Join-Path $d02 '6. Warranty') -Recurse -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipFile $_.Name) }).Count
[void]$report.AppendLine("6. Warranty: source=$srcW dest=$dstWN dedupedApprox=$($srcW - $dstWN)")

$srcG = @(Get-ChildItem -LiteralPath $genSrc -Recurse -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipFile $_.Name) }).Count
$dstGN = @(Get-ChildItem -LiteralPath (Join-Path $d02 'General') -Recurse -File -Force -EA SilentlyContinue | Where-Object { -not (Test-SkipFile $_.Name) }).Count
[void]$report.AppendLine("General: source=$srcG dest=$dstGN match=$($srcG -eq $dstGN)")

$reportPath = Join-Path $d02 '_file-matrix-build-report.txt'
[System.IO.File]::WriteAllText($reportPath, $report.ToString(), [System.Text.UTF8Encoding]::new($true))
Copy-Item -LiteralPath $mapPath -Destination (Join-Path $d02 '_file-matrix-copy-map.csv') -Force
Copy-Item -LiteralPath $resultPath -Destination (Join-Path $d02 '_file-matrix-copy-results.csv') -Force
Write-Host "REPORT=$reportPath"
