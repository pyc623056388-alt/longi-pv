#Requires -Version 5.1
<#
.SYNOPSIS
  Build product x attribute matrix from 01 Product Matrix.
.PARAMETER Apply
  Write files to File Index. Default is dry-run preview only.
#>
param(
  [switch]$Apply,
  [string]$FileIndexRoot = 'G:\My Drive\Longi\File Index',
  [string]$LogDir = "$env:TEMP\longi-product-matrix"
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# Build Unicode strings without relying on script file encoding
function U {
  param([Parameter(ValueFromRemainingArguments = $true)][int[]]$Codes)
  return (-join ($Codes | ForEach-Object { [char]$_ }))
}

# Chinese headers / filenames (codepoints)
$CN = @{
  Model   = (U 0x578B 0x53F7)             # xinghao
  Segment = (U 0x7EC6 0x5206)             # xifen
  Series  = (U 0x7CFB 0x5217)             # xilie
  Format  = (U 0x7248 0x578B)             # banxing
  FileStem = ('_' + (U 0x4EA7 0x54C1 0x5C5E 0x6027 0x77E9 0x9635))  # _chanpin shuxing juzhen
}

$d01 = (Get-ChildItem -LiteralPath $FileIndexRoot -Directory | Where-Object { $_.Name -like '01-*' } | Select-Object -First 1).FullName
if (-not $d01) { throw '01 Product Matrix not found' }
$segRoot = Join-Path $d01 'Product-Segments'
$outXlsx = Join-Path $FileIndexRoot ($CN.FileStem + '.xlsx')
$outCsv = Join-Path $FileIndexRoot ($CN.FileStem + '.csv')

function Test-SkipName([string]$name) {
  return ($name -eq 'desktop.ini' -or $name -like '_*')
}

function Get-Files([string]$path) {
  if (-not $path -or -not (Test-Path -LiteralPath $path)) { return @() }
  @(Get-ChildItem -LiteralPath $path -Recurse -File -Force -EA SilentlyContinue |
    Where-Object { -not (Test-SkipName $_.Name) })
}

function Find-TypeDir([string]$modelRoot, [string]$pattern) {
  Get-ChildItem -LiteralPath $modelRoot -Directory -Force -EA SilentlyContinue |
    Where-Object { $_.Name -match $pattern } |
    Select-Object -First 1
}

function Get-ModelsMentionedInCertName([string]$fileName) {
  $list = New-Object System.Collections.Generic.List[string]
  foreach ($m in [regex]::Matches($fileName, 'LR\d+-\d+[A-Z]+')) {
    if (-not $list.Contains($m.Value)) { $list.Add($m.Value) }
  }
  if ($fileName -match '54HVB\+54HVBB\+54HVD\+72HVDF' -or $fileName -match '54HVB\+54HVD\+72HVDF') {
    foreach ($m in @('LR7-54HVB', 'LR7-54HVBB', 'LR7-54HVD', 'LR7-72HVDF')) {
      if (-not $list.Contains($m)) { $list.Add($m) }
    }
  }
  return @($list)
}

function Test-CertBelongsToModel([string]$fileName, [string]$model) {
  $mentioned = @(Get-ModelsMentionedInCertName $fileName)
  if ($mentioned.Count -eq 0) { return $true }
  return ($mentioned -contains $model)
}

function Get-BelongingCertFiles([string]$dir, [string]$model) {
  @(Get-Files $dir | Where-Object { Test-CertBelongsToModel $_.Name $model })
}

function Get-CertFilesByPattern([string]$certRoot, [string]$model, [string]$pattern) {
  if (-not $certRoot) { return @() }
  $dirs = @(Get-ChildItem -LiteralPath $certRoot -Directory -Force -EA SilentlyContinue |
    Where-Object { $_.Name -match $pattern })
  $all = @()
  foreach ($d in $dirs) { $all += @(Get-BelongingCertFiles $d.FullName $model) }
  return $all
}

function Get-YN([int]$count) {
  if ($count -gt 0) { return 'Y' }
  return ([char]0x2014).ToString()
}

function Get-Segment([string]$model) {
  # Product positioning for customer scenarios (not file-pack completeness)
  if ($model -match 'HVHL$') { return 'Lightweight' }
  if ($model -match 'HVHF$') { return 'AntiDust' }
  if ($model -match 'HVB') { return 'Premium-AllBlack' }
  if ($model -match 'HYD$') { return 'IceShield' }
  if ($model -eq 'LR7-54HVDT') { return 'Standard' }
  if ($model -match '^LR7-' -and ($model -match 'HVH$' -or $model -match 'HVD$')) { return 'Standard' }
  if ($model -match 'HVDF$') { return 'Specialty' }
  if ($model -notmatch '^LR7-') { return 'Specialty' }
  return 'Other'
}

function Get-Series([string]$model) {
  if ($model -match '^(LR\d+)-') { return $Matches[1] }
  return ''
}

function Get-Format([string]$model) {
  if ($model -match '-(\d+)') { return $Matches[1] }
  return ''
}

function Get-SaltMistCode([object[]]$files) {
  if (-not $files -or $files.Count -eq 0) { return ([char]0x2014).ToString() }
  $levels = New-Object System.Collections.Generic.List[string]
  foreach ($f in $files) {
    $n = $f.Name
    if ($n -match 'L1\+L6') {
      if (-not $levels.Contains('L1+L6')) { $levels.Add('L1+L6') }
    } else {
      if ($n -match 'L8' -and -not $levels.Contains('L8')) { $levels.Add('L8') }
      if ($n -match 'L6' -and $n -notmatch 'L1\+L6' -and -not $levels.Contains('L6')) { $levels.Add('L6') }
      if ($n -match 'L1' -and $n -notmatch 'L1\+L6' -and -not $levels.Contains('L1')) { $levels.Add('L1') }
    }
  }
  if ($levels.Count -eq 0) { return 'Y' }
  if ($levels -contains 'L1' -and $levels -contains 'L6' -and $levels -notcontains 'L1+L6') {
    [void]$levels.Remove('L1')
    [void]$levels.Remove('L6')
    $levels.Insert(0, 'L1|L6')
  }
  return ($levels -join ';')
}

function Get-HailCode([object[]]$files) {
  if (-not $files -or $files.Count -eq 0) { return ([char]0x2014).ToString() }
  $angle = [char]0x2220
  $codes = New-Object System.Collections.Generic.List[string]
  foreach ($f in $files) {
    $n = $f.Name
    if ($n -match '25mm') { continue }
    $code = $null
    if ($n -match 'HW4') { $code = 'HW4' }
    elseif ($n -match '65mm' -and $n -match 'Angle60') { $code = "HI65${angle}60" }
    elseif ($n -match '55mm' -and $n -match 'Angle30' -and $n -match '3\.2') { $code = "HI55${angle}30(3.2)" }
    elseif ($n -match '55mm' -and $n -match 'Angle30' -and $n -match '2\.8') { $code = "HI55${angle}30(2.8)" }
    elseif ($n -match '45mm' -and $n -match '2\.8') { $code = 'HI45' }
    elseif ($n -match '35\+45') { $code = 'HI35+45' }
    elseif ($n -match '45mm') { $code = 'HI45' }
    elseif ($n -match '55mm') { $code = 'HI55' }
    elseif ($n -match '65mm') { $code = 'HI65' }
    else { $code = 'Enhanced' }
    if ($code -and -not $codes.Contains($code)) { $codes.Add($code) }
  }
  if ($codes.Count -eq 0) { return ([char]0x2014).ToString() }
  return ($codes -join ';')
}

function Get-AntiGlareCode([object[]]$files) {
  if (-not $files -or $files.Count -eq 0) { return ([char]0x2014).ToString() }
  $has10 = $false
  $has20 = $false
  foreach ($f in $files) {
    $n = $f.Name
    if ($n -match '2\.0|Pro_EcoLife|BRDF') { $has20 = $true }
    elseif ($n -match '1\.0|Guardian|Antiglare|Antigalre|AntiGlare') { $has10 = $true }
  }
  $parts = @()
  if ($has10) { $parts += '1.0' }
  if ($has20) { $parts += '2.0' }
  if ($parts.Count -eq 0) { return 'Y' }
  return ($parts -join ';')
}

function Get-WindCode([object[]]$files) {
  if (-not $files -or $files.Count -eq 0) { return ([char]0x2014).ToString() }
  foreach ($f in $files) {
    if ($f.Name -match 'Albright') { return 'Albright' }
  }
  return 'Y'
}

function Get-FireCode([object[]]$files) {
  if (-not $files -or $files.Count -eq 0) { return ([char]0x2014).ToString() }
  foreach ($f in $files) {
    if ($f.Name -match 'ClassA|Class A') { return 'ClassA' }
  }
  return 'Y'
}

function Get-GlassVariants([object[]]$datasheets, [string]$model) {
  if ($model -ne 'LR8-66HYD') { return ([char]0x2014).ToString() }
  $variants = New-Object System.Collections.Generic.List[string]
  foreach ($f in $datasheets) {
    $n = $f.Name
    if ($n -match 'Glass2\.0\+2') { if (-not $variants.Contains('2.0+2')) { $variants.Add('2.0+2') } }
    if ($n -match 'Glass2\.8\+2') { if (-not $variants.Contains('2.8+2 IceShield')) { $variants.Add('2.8+2 IceShield') } }
    if ($n -match 'Glass3\.2\+2') { if (-not $variants.Contains('3.2+2 IceShield')) { $variants.Add('3.2+2 IceShield') } }
  }
  if ($variants.Count -eq 0) { return ([char]0x2014).ToString() }
  return ($variants -join ';')
}

function Get-MultiHailNote([object[]]$hailFiles) {
  if (-not $hailFiles -or $hailFiles.Count -eq 0) { return ([char]0x2014).ToString() }
  $notes = New-Object System.Collections.Generic.List[string]
  foreach ($f in $hailFiles) {
    $mentioned = @(Get-ModelsMentionedInCertName $f.Name)
    if ($mentioned.Count -gt 1) {
      $note = ($mentioned -join '+')
      if (-not $notes.Contains($note)) { $notes.Add($note) }
    }
  }
  if ($notes.Count -eq 0) { return ([char]0x2014).ToString() }
  return ($notes -join ' | ')
}

function Get-SegmentSortKey([string]$seg) {
  switch ($seg) {
    'Standard' { return 1 }
    'Lightweight' { return 2 }
    'Premium-AllBlack' { return 3 }
    'AntiDust' { return 4 }
    'IceShield' { return 5 }
    'Specialty' { return 6 }
    default { return 9 }
  }
}

$dash = ([char]0x2014).ToString()
$rows = New-Object System.Collections.Generic.List[object]

# Scenario-focused columns only (drop universal packs / core certs everyone has)
$colOrder = @(
  'Model', 'Segment',
  'AntiDust', 'AntiGlare', 'Hail', 'MarineL8', 'HighWind', 'Fire',
  'GlassVariants'
)
$headerMap = @{
  Model   = $CN.Model
  Segment = $CN.Segment
}

Get-ChildItem -LiteralPath $segRoot -Directory | ForEach-Object {
  $model = $_.Name
  if ($model -match 'HVDA') { return }

  $root = $_.FullName
  $dsDir = Find-TypeDir $root '^1\.\s*Datasheet'
  $certDir = Find-TypeDir $root '^2\.\s*Certificate'
  $dsFiles = @(Get-Files $(if ($dsDir) { $dsDir.FullName } else { $null }))
  $certRootPath = if ($certDir) { $certDir.FullName } else { $null }

  $salt = @(Get-CertFilesByPattern $certRootPath $model 'SaltMist')
  $hail = @(Get-CertFilesByPattern $certRootPath $model '^Hail')
  $ag = @(Get-CertFilesByPattern $certRootPath $model 'AntiGlare|anti-glare|Antiglare')
  $wind = @(Get-CertFilesByPattern $certRootPath $model '^Wind')
  $fire = @(Get-CertFilesByPattern $certRootPath $model '^Fire')

  $saltCode = Get-SaltMistCode $salt
  $marineL8 = if ($saltCode -match 'L8') { 'Y' } else { $dash }
  $seg = Get-Segment $model

  # AntiDust = product line (HVHF), NOT universal DustSand cert
  $antiDust = if ($model -match 'HVHF$') { 'Y' } else { $dash }

  $rows.Add([pscustomobject]@{
    Model         = $model
    Segment       = $seg
    AntiDust      = $antiDust
    AntiGlare     = Get-AntiGlareCode $ag
    Hail          = Get-HailCode $hail
    MarineL8      = $marineL8
    HighWind      = Get-WindCode $wind
    Fire          = Get-FireCode $fire
    GlassVariants = Get-GlassVariants $dsFiles $model
  }) | Out-Null
}

$sorted = @($rows | Sort-Object { Get-SegmentSortKey $_.Segment }, Model)

Write-Host "MODELS=$($sorted.Count)"
$sorted | ForEach-Object {
  "$($_.Model) | $($_.Segment) | Dust=$($_.AntiDust) | AG=$($_.AntiGlare) | Hail=$($_.Hail) | Marine=$($_.MarineL8) | Wind=$($_.HighWind) | Fire=$($_.Fire) | Glass=$($_.GlassVariants)"
}

if (-not $Apply) {
  Write-Host 'DRY-RUN only. Re-run with -Apply to write files.'
  exit 0
}

function Get-DisplayHeader([string]$key) {
  if ($headerMap.ContainsKey($key)) { return $headerMap[$key] }
  return $key
}

$displayHeaders = @($colOrder | ForEach-Object { Get-DisplayHeader $_ })

# --- CSV ---
$csvLines = New-Object System.Collections.Generic.List[string]
$csvLines.Add(($displayHeaders | ForEach-Object {
  if ($_ -match '[,"]') { '"' + ($_ -replace '"', '""') + '"' } else { $_ }
}) -join ',')

foreach ($row in $sorted) {
  $vals = foreach ($c in $colOrder) {
    $v = [string]$row.$c
    if ($null -eq $v) { $v = '' }
    if ($v -match '[,"\r\n]') { '"' + ($v -replace '"', '""') + '"' } else { $v }
  }
  $csvLines.Add(($vals -join ','))
}
$utf8Bom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllLines($outCsv, $csvLines.ToArray(), $utf8Bom)
Write-Host "CSV=$outCsv"

# --- Legend ---
$legend = @(
  @{ Item = 'Purpose'; Meaning = 'Customer scenario differentiators only; universal packs/certs omitted' }
  @{ Item = 'Segment'; Meaning = 'Standard / Lightweight(L) / Premium-AllBlack(B) / AntiDust(HVHF) / IceShield(HYD) / Specialty' }
  @{ Item = 'AntiDust'; Meaning = 'Y only for HVHF product line (not universal DustSand cert)' }
  @{ Item = 'AntiGlare'; Meaning = '1.0 / 2.0 grades when model-specific files exist' }
  @{ Item = 'Hail'; Meaning = 'Enhanced hail grades only (25mm excluded)' }
  @{ Item = 'MarineL8'; Meaning = 'Y only when L8 salt-mist file exists (L1/L6 not shown)' }
  @{ Item = 'HighWind / Fire'; Meaning = 'Albright / ClassA when model-specific report exists' }
  @{ Item = 'GlassVariants'; Meaning = 'IceShield glass options (mainly LR8-66HYD)' }
  @{ Item = 'Dash'; Meaning = ([char]0x2014).ToString() + ' = not applicable / no scenario evidence' }
  @{ Item = 'Source'; Meaning = '01 Product-Segments; strict LR* cert-model match; HVDA excluded' }
  @{ Item = 'Generated'; Meaning = (Get-Date -Format 'yyyy-MM-dd HH:mm') }
)

# --- XLSX via Excel COM ---
$excel = $null
$wb = $null
try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $wb = $excel.Workbooks.Add()

  # Remove extra default sheets if any, keep one
  while ($wb.Worksheets.Count -gt 1) {
    $wb.Worksheets.Item($wb.Worksheets.Count).Delete()
  }

  $ws = $wb.Worksheets.Item(1)
  $ws.Name = 'Matrix'

  for ($c = 0; $c -lt $colOrder.Count; $c++) {
    $ws.Cells.Item(1, $c + 1) = $displayHeaders[$c]
  }
  for ($r = 0; $r -lt $sorted.Count; $r++) {
    $row = $sorted[$r]
    for ($c = 0; $c -lt $colOrder.Count; $c++) {
      $key = $colOrder[$c]
      $ws.Cells.Item($r + 2, $c + 1) = [string]$row.$key
    }
  }

  $endRow = $sorted.Count + 1
  $endCol = $colOrder.Count
  $used = $ws.Range($ws.Cells.Item(1, 1), $ws.Cells.Item($endRow, $endCol))
  $used.AutoFilter() | Out-Null
  $header = $ws.Range($ws.Cells.Item(1, 1), $ws.Cells.Item(1, $endCol))
  $header.Font.Bold = $true
  $ws.Columns.AutoFit() | Out-Null

  $ws2 = $wb.Worksheets.Add([System.Reflection.Missing]::Value, $ws)
  $ws2.Name = 'Legend'
  $ws2.Cells.Item(1, 1) = 'Item'
  $ws2.Cells.Item(1, 2) = 'Meaning'
  $ws2.Cells.Item(1, 1).Font.Bold = $true
  $ws2.Cells.Item(1, 2).Font.Bold = $true
  for ($i = 0; $i -lt $legend.Count; $i++) {
    $ws2.Cells.Item($i + 2, 1) = $legend[$i].Item
    $ws2.Cells.Item($i + 2, 2) = $legend[$i].Meaning
  }
  $ws2.Columns.AutoFit() | Out-Null

  $ws.Activate() | Out-Null
  $ws.Cells.Item(2, 2).Select() | Out-Null
  $excel.ActiveWindow.FreezePanes = $true

  # Prefer overwrite in place; if locked, write a sibling file
  $savePath = $outXlsx
  try {
    if (Test-Path -LiteralPath $outXlsx) {
      # Try unlock via overwrite SaveAs without prior delete
    }
    $wb.SaveAs($savePath, 51) | Out-Null
  } catch {
    $savePath = Join-Path $FileIndexRoot ($CN.FileStem + '_updated.xlsx')
    $wb.SaveAs($savePath, 51) | Out-Null
    Write-Host "XLSX_LOCKED_ORIGINAL; wrote alternate"
  }
  Write-Host "XLSX=$savePath"
}
finally {
  if ($wb) { try { $wb.Close($false) | Out-Null } catch {} }
  if ($excel) {
    try { $excel.Quit() | Out-Null } catch {}
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null } catch {}
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Host 'DONE'
