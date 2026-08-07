#Requires -Version 5.1
<#
.SYNOPSIS
  Rename LONGi certificate files/folders per naming convention.
#>
param(
  [switch]$Apply,
  [string]$LogDir = "$env:TEMP\longi-cert-rename"
)
$DryRun = -not $Apply

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$matrixBase = (Get-ChildItem -LiteralPath 'G:\My Drive\Longi\File Index' -Directory | Where-Object { $_.Name -like '0-*' }).FullName
$centralRoot = 'G:\My Drive\Longi\File Index\certificate'
$segRoot = Join-Path $matrixBase 'Product-Segments'

$folderMap = [ordered]@{
  'Hail-resistance'         = 'Hail'
  'Salt Mist-IEC61701'      = 'SaltMist-IEC61701'
  'dust&sand'               = 'DustSand'
  'Dynamic Mechanical Load' = 'DML'
  'Fire-resistance'         = 'Fire'
  'anti-glare'              = 'AntiGlare'
  'IEC 61215+61730_2023'    = 'IEC61215+61730_2023'
  'IEC 61215+61730_2016'    = 'IEC61215+61730_2016'
  'degradation'             = 'Degradation'
  'backsheet'               = 'Backsheet'
}

function Get-SafeFileName([string]$name) {
  $invalid = [IO.Path]::GetInvalidFileNameChars()
  $chars = foreach ($ch in $name.ToCharArray()) {
    if ($invalid -contains $ch -or $ch -eq ' ') { '_' } else { $ch }
  }
  $s = -join $chars
  ($s -replace '_+', '_' -replace '^_|_$', '')
}

function Normalize-TopFolder([string]$folder) {
  switch -Regex ($folder) {
    '^(Hail-resistance|Hail)$' { return 'Hail' }
    '^(Salt Mist-IEC61701|SaltMist-IEC61701)$' { return 'SaltMist-IEC61701' }
    '^(dust&sand|DustSand)$' { return 'DustSand' }
    '^(Dynamic Mechanical Load|DML)$' { return 'DML' }
    '^(Fire-resistance|Fire)$' { return 'Fire' }
    '^(anti-glare|Anti-glare|AntiGlare)$' { return 'AntiGlare' }
    '^(IEC 61215\+61730_2023|IEC61215\+61730_2023)$' { return 'IEC61215+61730_2023' }
    '^(IEC 61215\+61730_2016|IEC61215\+61730_2016)$' { return 'IEC61215+61730_2016' }
    '^(degradation|Degradation)$' { return 'Degradation' }
    '^(backsheet|Backsheet)$' { return 'Backsheet' }
    '^(Ammonia-IEC62716)$' { return 'Ammonia-IEC62716' }
    '^(Wind)$' { return 'Wind' }
    '^(UV)$' { return 'UV' }
    '^(CEC)$' { return 'CEC' }
    '^(EPD)$' { return 'EPD' }
    default { return $folder }
  }
}

function Map-SubFolderLeaf([string]$leaf, [string]$parentPath = '') {
  # Nested Anti-glare under anti-glare must not collide with parent AntiGlare.
  # Only treat as nested when parentPath contains a separator (not the top folder itself).
  $parentDir = Split-Path $parentPath -Parent
  if ($leaf -match '^[Aa]nti-[Gg]lare$' -and $parentDir -and ($parentDir -match '[Aa]nti-[Gg]lare|[Aa]nti[Gg]lare')) {
    return 'Assets'
  }
  if ($folderMap.Contains($leaf)) { return $folderMap[$leaf] }
  if ($leaf -match 'CDF' -and $leaf -match '\+') { return 'Cert-TR-CDF' }
  if ($leaf -match 'Albright' -and $leaf -ne 'Albright') { return 'Albright' }
  if ($leaf -match 'SECA' -and $leaf -ne 'SECA') { return 'SECA' }
  if ($leaf -match 'Anti-Glare Module Datasheet' -or ($leaf -match 'Anti-Glare' -and $leaf -match 'Datasheet')) { return 'Datasheet' }
  return $null
}

function Map-SubFolderLeafHeuristic([string]$leaf, [string]$parentPath) {
  $mapped = Map-SubFolderLeaf $leaf $parentPath
  if ($mapped) { return $mapped }

  # Wind subfolders: detect by sibling context / unique names without Chinese in script
  # Use Unicode codepoints for known Chinese folder names
  $u = {
    param([int[]]$codes)
    -join ($codes | ForEach-Object { [char]$_ })
  }
  $nameCertPack = & $u 0x62A5,0x544A,0x002B,0x8BC1,0x4E66,0x002B,0x0043,0x0044,0x0046  # 报告+证书+CDF
  $nameLib = & $u 0x8BA4,0x8BC1,0x6587,0x4EF6,0x5E93  # 认证文件库
  $namePrior = & $u 0x524D,0x5E8F,0x8BA4,0x8BC1  # 前序认证
  $nameDone = & $u 0x5DF2,0x5B8C,0x6210,0x8BA4,0x8BC1  # 已完成认证
  $nameFlow = & $u 0x6D41,0x7A0B  # 流程
  $nameAlbApp = 'Albright' + (& $u 0x8BA4,0x8BC1,0x7533,0x8BF7)  # Albright认证申请
  $nameSecaApp = 'SECA' + (& $u 0x8BA4,0x8BC1,0x7533,0x8BF7)  # SECA认证申请
  $nameAgDs = (& $u 0x9632,0x7729,0x5149,0x7EC4,0x4EF6,0x89C4,0x683C,0x4E66) + ' Anti-Glare Module Datasheet'

  switch ($leaf) {
    $nameCertPack { return 'Cert-TR-CDF' }
    $namePrior { return 'Prior' }
    $nameDone { return 'Completed' }
    $nameFlow { return 'Process' }
    $nameAlbApp { return 'Albright' }
    $nameSecaApp { return 'SECA' }
    $nameAgDs { return 'Datasheet' }
  }
  if ($leaf -eq $nameLib -or $leaf.StartsWith($nameLib)) { return 'CertBundle' }
  return $null
}

function Get-NewFileName {
  param(
    [string]$Folder,
    [string]$Name,
    [string]$RelPath = ''
  )

  $ext = [IO.Path]::GetExtension($Name)
  $base = [IO.Path]::GetFileNameWithoutExtension($Name)
  $n = $Name
  $folderNorm = Normalize-TopFolder $Folder

  switch ($folderNorm) {
    'Ammonia-IEC62716' {
      if ($n -match 'Single') { return "Ammonia_IEC62716_Single_Cert$ext" }
      if ($n -match 'Double') { return "Ammonia_IEC62716_Double_Cert$ext" }
    }
    'SaltMist-IEC61701' {
      if ($n -match 'Seaside Installation') { return "SaltMist_IEC61701_Seaside_Guide$ext" }
      if ($n -match 'TRF_IEC_61701|Salt_Mist_Test') { return "SaltMist_IEC61701_L8_LR8-66HYD_TRF$ext" }
      # Chinese salt mist report: contains IEC 61701 TRF pattern already; also match Copy of + LR8
      if ($n -match 'LR8-66HYD' -and $n -match '61701') { return "SaltMist_IEC61701_L8_LR8-66HYD_TRF$ext" }
      if ($n -match 'Single' -and $n -match 'level 1') { return "SaltMist_IEC61701_L1+L6_Single_Cert$ext" }
      if ($n -match 'Double' -and $n -match 'level 6' -and $n -notmatch 'level 1') { return "SaltMist_IEC61701_L6_Double_Cert$ext" }
      if ($n -match 'Double' -and $n -match 'level 1' -and $n -notmatch 'level 6|&') { return "SaltMist_IEC61701_L1_Double_Cert$ext" }
    }
    'DustSand' {
      if ($n -match 'Single') { return "DustSand_TUV_Single_Cert$ext" }
      if ($n -match 'Double') { return "DustSand_TUV_Double_Cert$ext" }
      if ($ext -eq '.zip') { return "DustSand_TUV_CertBundle$ext" }
    }
    'DML' {
      if ($n -match 'Single') { return "DML_TUV_Single_Cert$ext" }
      if ($n -match 'Double') { return "DML_TUV_Double_Cert$ext" }
      if ($ext -eq '.zip') { return "DML_TUV_CertBundle$ext" }
    }
    'IEC61215+61730_2023' {
      if ($n -match 'Single') { return "IEC_61215+61730_2023_Single_Cert$ext" }
      if ($n -match 'Double') { return "IEC_61215+61730_2023_Double_Cert$ext" }
      if ($ext -eq '.zip') { return "IEC_61215+61730_2023_CertBundle$ext" }
    }
    'IEC61215+61730_2016' {
      if ($n -match 'Single' -or $base -eq 'Single') { return "IEC_61215+61730_2016_Single_Cert$ext" }
      if ($n -match 'Double') { return "IEC_61215+61730_2016_Double_Cert$ext" }
    }
    'Hail' {
      if ($n -match 'HI55|55mm') { return "Hail_55mm_IEC61215_LR8-66HYD_Cert$ext" }
      if ($n -match 'HI45' -and $n -match 'LR8-66HYD') { return "Hail_45mm_IEC61215_LR8-66HYD_Cert$ext" }
      if ($n -match 'HW4' -and $n -match 'LR8-66HYD') { return "Hail_HW4_VKF_LR8-66HYD_Report$ext" }
      if ($base -eq 'HW4') { return "Hail_HW4_VKF_Overview$ext" }
      if ($n -match 'HI35\+45' -and $n -match 'LR7-54HVH' -and $n -notmatch 'HVB') { return "Hail_35+45mm_IEC61215_LR7-54HVH_Cert$ext" }
      if ($n -match 'HI35\+45' -and $n -match '54HVB') { return "Hail_35+45mm_IEC61215_LR7-54HVB_Cert$ext" }
    }
    'Fire' {
      if ($n -match 'LR8-66HYD') { return "Fire_ClassA_LR8-66HYD_Report$ext" }
      if ($n -match 'LR7-72HVDA') { return "Fire_ClassA_LR7-72HVDA_Report$ext" }
      if ($n -match 'Class A_LR7-72HVD' -and $n -notmatch 'HVDA') { return "Fire_ClassA_LR7-72HVD_Report$ext" }
      if ($n -match 'LR7-72HYD') { return "Fire_ClassA_LR7-72HYD_Report$ext" }
      if ($n -match 'Class A' -and $n -match 'LR7-72') { return "Fire_ClassA_LR7-72HVD_Report$ext" }
    }
    'Degradation' {
      if ($n -match 'UV30' -or $n -match 'LR8-66HYD') {
        return "Degradation_UV30+UV30+UV60_LR8-66HYD_Report$ext"
      }
    }
    'Wind' {
      if ($n -match 'ACE 25-146\.01' -or $n -match 'LR7-54HVH-XXXM') {
        return "Wind_Albright_LR7-54HVH_Report$ext"
      }
      if ($n -match 'ACE FP 26-0109\.01') { return "Wind_Albright_FP26-0109-01_Report$ext" }
      if ($n -match 'ACE FP 26-0109\.02') { return "Wind_Albright_FP26-0109-02_Report$ext" }
      if ($n -match 'Quote QU138') { return "Support_Wind_SECA_Quote_QU138$ext" }
      if ($ext -eq '.msg' -and $n -match 'FP 26-109|FP26-109|26-109') { return "Support_Wind_Albright_FP26-109_Email$ext" }
      $doneMark = -join ([char]0x5DF2, [char]0x5B8C, [char]0x6210)      # completed
      $flowMark = -join ([char]0x6D41, [char]0x7A0B)                    # process
      if ($base -eq 'Albright' -and $ext -eq '.pdf') {
        if ($RelPath -match "Completed|$doneMark") { return "Wind_Albright_Completed_Cert$ext" }
        return "Wind_Albright_Cert$ext"
      }
      if ($ext -eq '.pdf' -and $n -match 'Albright' -and $n -notmatch 'ACE|FP ') {
        if ($RelPath -match "Process|$flowMark") { return "Support_Wind_Albright_Process$ext" }
        return "Support_Wind_Albright_Process$ext"
      }
    }
    'AntiGlare' {
      if ($ext -in @('.mp4', '.pptx', '.zip')) {
        if ($n -match 'Normal VS') { return "Support_AntiGlare_Normal_vs_1.0_vs_2.0$ext" }
        if ($n -match 'Video EN') { return "Support_AntiGlare_Video_EN$ext" }
        if ($n -match 'Introduction') { return "Support_AntiGlare_Introduction_EN$ext" }
        if ($n -match 'Datasheet' -or $ext -eq '.zip') { return "Support_AntiGlare_DatasheetBundle$ext" }
        return "Support_AntiGlare_$(Get-SafeFileName $base)$ext"
      }
      if ($n -match 'CN264UDJ') { return "AntiGlare_CN264UDJ_Report$ext" }
      if ($n -match 'LR7-xxHVD_Bifacial') { return "AntiGlare_GlareReflection_LR7-xxHVD_TR$ext" }
      if ($n -match 'LR7-xxHVH_Monofacial') { return "AntiGlare_GlareReflection_LR7-xxHVH_TR$ext" }
      if ($n -match 'LR8-66HVD' -and $n -match 'BRDF') { return "AntiGlare_2.0_BRDF_LR8-66HVD_Report$ext" }
      if ($n -match 'EcoLife' -and $n -match 'LR7-54HVB') { return "AntiGlare_Pro_EcoLife_LR7-54HVB_Datasheet$ext" }
      if ($n -match 'LR7-54HVH' -and ($n -match 'Beta|460~480|460')) { return "AntiGlare_2.0_LR7-54HVH_Datasheet$ext" }
      if ($n -match 'LR7-54HVH' -and $n -match 'Anti Glare|Anti-Glare|BGV03') { return "AntiGlare_Guardian_LR7-54HVH_Datasheet$ext" }
      if ($n -match 'LR7-72HVH') { return "AntiGlare_Guardian_LR7-72HVH_Datasheet$ext" }
      if ($n -match 'LR7-72HVD') { return "AntiGlare_Guardian_LR7-72HVD_Datasheet$ext" }
      if ($n -match 'LR8-66HVD' -and $n -match 'Guardian|BGV03|Anti-Glare|Anti Glare') {
        return "AntiGlare_Guardian_LR8-66HVD_Datasheet$ext"
      }
      # Chinese-named AntiGlare reports without BRDF ascii - match LR8-66HVD + pdf in anti-glare root
      if ($n -match 'LR8-66HVD' -and $ext -eq '.pdf' -and $n -notmatch 'Guardian|BGV03|640-670') {
        return "AntiGlare_2.0_BRDF_LR8-66HVD_Report$ext"
      }
      if ($n -match '2\.0' -and $n -match 'TUV|Rhein|report|Cert|证书') { return "AntiGlare_2.0_TUV_Cert$ext" }
      # Product matrix Chinese pdf
      if ($ext -eq '.pdf' -and $n -notmatch 'LR7|LR8|CN264|Glare Reflection') {
        if ($n -match '2\.0') { return "AntiGlare_2.0_TUV_Cert$ext" }
        return "Support_AntiGlare_ProductMatrix$ext"
      }
    }
    'UV' {
      if ($n -match 'PID') { return "UV_PID_TUV_Cert$ext" }
      if ($n -match '704062103446') { return "UV_TUV_Cert_704062103446-13$ext" }
      if ($n -match '704061718722') { return "UV_PID_TUV_Cert$ext" }
      return "UV_TUV_Reliability_Report$ext"
    }
    'EPD' {
      if ($n -match 'ITALY|EPDITALY') { return "EPD_Italy_MR-EPDITALY0114$ext" }
      if ($n -match 'Hi-MO9') { return "EPD_Norway_Hi-MO9_V2$ext" }
      # Italy / Norway by remaining
      if ($n -match 'MR-EPD') { return "EPD_Italy_MR-EPDITALY0114$ext" }
      return "EPD_Norway_Hi-MO9_V2$ext"
    }
    'Backsheet' {
      if ($n -match 'Tedlar') { return "Support_Backsheet_Tedlar_K26867_Bulletin$ext" }
    }
    'CEC' {
      if ($n -match 'invoicePDF' -and $n -match 'LGi202606010064') { return "Support_CEC_LGi202606010064_Invoice$ext" }
      if ($base -eq 'invoicePDF') { return "Support_CEC_Invoice$ext" }
      if ($n -match 'IMG_7048' -and $n -match 'LGi202606010064') { return "Support_CEC_LGi202606010064_IMG_7048$ext" }
      if ($n -match 'IMG_7048') { return "Support_CEC_IMG_7048$ext" }
      if ($n -match 'Code rules|bar code|pallet number') { return "Support_CEC_Barcode_Pallet_Label_Rules$ext" }
      if ($n -match 'LGi202606010064' -and $ext -eq '.pdf' -and $n -notmatch 'invoice|IMG|CERT|TR|CDF|TRF') {
        return "Support_CEC_LGi202606010064_FeeApplication$ext"
      }
      if ($ext -eq '.png') { return "Support_CEC_Application_Ack$ext" }
      if ($base.Length -le 4 -and $ext -eq '.pdf') { return "Support_CEC_Print$ext" }

      if ($n -match '704062401208-12') {
        if ($n -match 'CERT') { return "CEC_TUV_704062401208-12_Cert$ext" }
        if ($n -match 'CDF') { return "CEC_TUV_704062401208-12_CDF$ext" }
        if ($n -match 'TR_TUV' -and $n -match 'LR9') { return "CEC_TUV_704062401208-12_TR_LR9-66HYD+LR8-60+54+48HVD$ext" }
        if ($n -match 'TRF' -and $n -match 'part 1') { return "CEC_TUV_704062401208-12_TRF_Part1of4$ext" }
        if ($n -match 'TRF' -and $n -match 'part 2') { return "CEC_TUV_704062401208-12_TRF_Part2of4$ext" }
        if ($n -match 'TRF' -and $n -match 'part 3') { return "CEC_TUV_704062401208-12_TRF_Part3of4$ext" }
        if ($n -match 'TRF' -and $n -match 'part 4') { return "CEC_TUV_704062401208-12_TRF_Part4of4$ext" }
      }
      if ($n -match '704062401243-03') {
        if ($n -match 'CERT') { return "CEC_TUV_704062401243-03_Cert$ext" }
        if ($n -match 'CDF') { return "CEC_TUV_704062401243-03_CDF$ext" }
        if ($n -match 'TR_TUV') { return "CEC_TUV_704062401243-03_TR_BCGen2$ext" }
        if ($n -match 'TRF' -and $n -match 'part 1') { return "CEC_TUV_704062401243-03_TRF_Part1of2$ext" }
        if ($n -match 'TRF' -and $n -match 'part 2') { return "CEC_TUV_704062401243-03_TRF_Part2of2$ext" }
      }
      if ($n -match '704062401243-04') {
        if ($n -match 'CERT') { return "CEC_TUV_704062401243-04_Cert$ext" }
        if ($n -match 'CDF') { return "CEC_TUV_704062401243-04_CDF$ext" }
        if ($n -match 'TR_TUV' -and $n -match 'LR7-48HVH') { return "CEC_TUV_704062401243-04_TR_LR7-48HVH$ext" }
      }
      if ($n -match '704062401243-08') {
        $nNorm = ($n -replace '[\u00A0\u2000-\u200B\uFEFF]', ' ')
        if ($nNorm -match 'CERT') { return "CEC_TUV_704062401243-08_Cert$ext" }
        if ($nNorm -match 'CDF') { return "CEC_TUV_704062401243-08_CDF$ext" }
        if ($nNorm -match 'TR_TUV' -and $nNorm -match 'HVH') { return "CEC_TUV_704062401243-08_TR_LR8-66+60+54+48HVH$ext" }
        if ($nNorm -match 'TRF' -and $nNorm -match 'part\s*1') { return "CEC_TUV_704062401243-08_TRF_Part1of2$ext" }
        if ($nNorm -match 'TRF' -and $nNorm -match 'part\s*2') { return "CEC_TUV_704062401243-08_TRF_Part2of2$ext" }
      }
    }
  }

  return "Support_$(Get-SafeFileName $base)$ext"
}

function Get-NewRelFolderPath([string]$relDir) {
  if ([string]::IsNullOrWhiteSpace($relDir)) { return '' }
  $parts = $relDir -split '[\\/]'
  $newParts = foreach ($p in $parts) {
    $m = Map-SubFolderLeafHeuristic $p $relDir
    if ($m) { $m } else { $p }
  }
  ($newParts -join '\')
}

$ops = New-Object System.Collections.Generic.List[object]

function Add-Op($action, $from, $to, $scope, $note = '') {
  $ops.Add([PSCustomObject]@{
    Action = $action
    Scope  = $scope
    From   = $from
    To     = $to
    Note   = $note
  })
}

function Plan-FileRenames([string]$root, [string]$scope) {
  Get-ChildItem -LiteralPath $root -Recurse -File -Force | Where-Object { $_.Name -ne 'desktop.ini' } | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length).TrimStart('\')
    $relDir = Split-Path $rel -Parent
    $topFolder = if ($relDir) { ($relDir -split '[\\/]')[0] } else { '' }
    $newName = Get-NewFileName -Folder $topFolder -Name $_.Name -RelPath $rel
    $newRelDir = Get-NewRelFolderPath $relDir
    $newRel = if ($newRelDir) { Join-Path $newRelDir $newName } else { $newName }
    $newFull = Join-Path $root $newRel
    if ($_.FullName -ne $newFull) {
      Add-Op 'RenameFile' $_.FullName $newFull $scope $rel
    }
  }
}

function Plan-FolderRenames([string]$root, [string]$scope) {
  $dirs = Get-ChildItem -LiteralPath $root -Recurse -Directory -Force |
    Sort-Object { $_.FullName.Length } -Descending

  foreach ($d in $dirs) {
    $rel = $d.FullName.Substring($root.Length).TrimStart('\')
    $parentRel = Split-Path $rel -Parent
    $leaf = Split-Path $rel -Leaf
    $newLeaf = Map-SubFolderLeafHeuristic $leaf $rel
    if ($newLeaf -and $newLeaf -ne $leaf) {
      $parentFull = if ($parentRel) { Join-Path $root $parentRel } else { $root }
      $to = Join-Path $parentFull $newLeaf
      Add-Op 'RenameFolder' $d.FullName $to $scope $rel
    }
  }
}

# Plan product matrix
Get-ChildItem -LiteralPath $segRoot -Directory | ForEach-Object {
  $model = $_.Name
  $certRoot = Join-Path $_.FullName '2. Certificate'
  if (-not (Test-Path -LiteralPath $certRoot)) { return }
  Plan-FileRenames $certRoot "Product:$model"
  Plan-FolderRenames $certRoot "Product:$model"
}

# Plan central
Plan-FileRenames $centralRoot 'Central'
Plan-FolderRenames $centralRoot 'Central'

$mapPath = Join-Path $LogDir 'rename-map.csv'
$ops | Export-Csv -LiteralPath $mapPath -NoTypeInformation -Encoding UTF8
Write-Host "PLANNED_OPS=$($ops.Count)"
Write-Host "MAP=$mapPath"
Write-Host "DRYRUN=$DryRun"

$collisions = $ops | Where-Object { $_.Action -eq 'RenameFile' } | Group-Object To | Where-Object { $_.Count -gt 1 }
if ($collisions) {
  Write-Host "COLLISIONS=$($collisions.Count)"
  $collisions | Select-Object -First 20 | ForEach-Object {
    Write-Host "TO=$($_.Name) count=$($_.Count)"
  }
}

# Preview unique new names
$ops | Where-Object { $_.Action -eq 'RenameFile' } |
  Select-Object Scope, @{n='Old';e={ Split-Path $_.From -Leaf }}, @{n='New';e={ Split-Path $_.To -Leaf }} |
  Sort-Object New -Unique |
  Format-Table -AutoSize | Out-String -Width 220 | Write-Host

if ($DryRun) {
  Write-Host 'Dry run only. Re-run with -DryRun:$false to apply.'
  exit 0
}

$fileOps = @($ops | Where-Object { $_.Action -eq 'RenameFile' })
$folderOps = @($ops | Where-Object { $_.Action -eq 'RenameFolder' } | Sort-Object { $_.From.Length } -Descending)
$results = New-Object System.Collections.Generic.List[object]

foreach ($op in $fileOps) {
  $from = $op.From
  try {
    if (-not (Test-Path -LiteralPath $from)) {
      $results.Add([PSCustomObject]@{ Status = 'Missing'; From = $from; To = $op.To })
      continue
    }
    $fromDir = Split-Path $from -Parent
    $toName = Split-Path $op.To -Leaf
    $actualTo = Join-Path $fromDir $toName
    if ((Test-Path -LiteralPath $actualTo) -and ((Resolve-Path -LiteralPath $actualTo).Path -ne (Resolve-Path -LiteralPath $from).Path)) {
      $stem = [IO.Path]::GetFileNameWithoutExtension($toName)
      $ext = [IO.Path]::GetExtension($toName)
      $i = 2
      while (Test-Path -LiteralPath $actualTo) {
        $actualTo = Join-Path $fromDir "${stem}_v$i$ext"
        $i++
      }
    }
    if ((Split-Path $from -Leaf) -ne (Split-Path $actualTo -Leaf)) {
      Rename-Item -LiteralPath $from -NewName (Split-Path $actualTo -Leaf)
    }
    $results.Add([PSCustomObject]@{ Status = 'OK'; From = $from; To = $actualTo })
  }
  catch {
    $results.Add([PSCustomObject]@{ Status = "ERR:$($_.Exception.Message)"; From = $from; To = $op.To })
  }
}

foreach ($op in $folderOps) {
  $from = $op.From
  $to = $op.To
  try {
    if (-not (Test-Path -LiteralPath $from)) {
      $results.Add([PSCustomObject]@{ Status = 'MissingFolder'; From = $from; To = $to })
      continue
    }
    if (Test-Path -LiteralPath $to) {
      Get-ChildItem -LiteralPath $from -Force | ForEach-Object {
        $dest = Join-Path $to $_.Name
        if (Test-Path -LiteralPath $dest) {
          if (-not $_.PSIsContainer) {
            $stem = [IO.Path]::GetFileNameWithoutExtension($_.Name)
            $ext = [IO.Path]::GetExtension($_.Name)
            $i = 2
            while (Test-Path -LiteralPath $dest) {
              $dest = Join-Path $to "${stem}_v$i$ext"
              $i++
            }
            Move-Item -LiteralPath $_.FullName -Destination $dest -Force
          }
        } else {
          Move-Item -LiteralPath $_.FullName -Destination $dest -Force
        }
      }
      $left = @(Get-ChildItem -LiteralPath $from -Force -ErrorAction SilentlyContinue)
      if ($left.Count -eq 0) { Remove-Item -LiteralPath $from -Force -Recurse }
      $results.Add([PSCustomObject]@{ Status = 'MergedFolder'; From = $from; To = $to })
    } else {
      Rename-Item -LiteralPath $from -NewName (Split-Path $to -Leaf)
      $results.Add([PSCustomObject]@{ Status = 'OKFolder'; From = $from; To = $to })
    }
  }
  catch {
    $results.Add([PSCustomObject]@{ Status = "ERRFolder:$($_.Exception.Message)"; From = $from; To = $to })
  }
}

$resultPath = Join-Path $LogDir 'rename-results.csv'
$results | Export-Csv -LiteralPath $resultPath -NoTypeInformation -Encoding UTF8
$ok = @($results | Where-Object { $_.Status -match '^(OK|OKFolder|MergedFolder)' }).Count
$err = @($results | Where-Object { $_.Status -match 'ERR|Missing' }).Count
Write-Host "DONE ok=$ok err=$err results=$resultPath"
