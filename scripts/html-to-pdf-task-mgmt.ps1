# Convert HTML project brief to PDF via Microsoft Word
$ErrorActionPreference = "Stop"

$htmlPath = Join-Path $PSScriptRoot "..\docs\au-task-management-project.html"
$pdfPath = Join-Path $PSScriptRoot "..\docs\AU-Task-Management-Project.pdf"

$htmlFull = (Resolve-Path $htmlPath).Path
$pdfFull = [System.IO.Path]::GetFullPath($pdfPath)

if (Test-Path $pdfFull) {
  Remove-Item -Force $pdfFull
}

$word = $null
$doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0

  # Open HTML (ConfirmConversions=False, ReadOnly=True, AddToRecentFiles=False)
  $doc = $word.Documents.Open($htmlFull, $false, $true, $false)

  # 17 = wdExportFormatPDF
  $doc.ExportAsFixedFormat(
    $pdfFull,
    17,        # OutputFileName handled as first arg in some signatures - use named via positional
    $false,    # OpenAfterExport
    0,         # OptimizeFor print
    0,         # Range entire
    0,         # From
    0,         # To
    0,         # Item document content
    $true,     # IncludeDocProps
    $true,     # KeepIRM
    0,         # CreateBookmarks
    $true,     # DocStructureTags
    $true,     # BitmapMissingFonts
    $false     # UseISO19005_1
  )

  $doc.Close([ref]$false)
  $doc = $null
  $word.Quit()
  $word = $null

  if (-not (Test-Path $pdfFull)) {
    throw "PDF was not created at $pdfFull"
  }

  $info = Get-Item $pdfFull
  Write-Output "OK: $($info.FullName) ($([math]::Round($info.Length/1KB,1)) KB)"
}
catch {
  if ($doc) { try { $doc.Close([ref]$false) } catch {} }
  if ($word) { try { $word.Quit() } catch {} }
  throw
}
finally {
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}
