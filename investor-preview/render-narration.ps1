param([string]$OnlyChapter = '')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$projectRoot = $PSScriptRoot
$chapters = Get-Content -LiteralPath (Join-Path $projectRoot 'narration-script.json') -Raw | ConvertFrom-Json
$audioRoot = Join-Path $projectRoot 'dist/assets/narration'
$workRoot = Join-Path $projectRoot '.video-work/narration'
New-Item -ItemType Directory -Path $audioRoot,$workRoot -Force | Out-Null
$narrator = New-Object System.Speech.Synthesis.SpeechSynthesizer
$narrator.SelectVoice('Microsoft Zira Desktop')
$narrator.Rate = 0
$receipts = @()
try {
  foreach ($chapter in $chapters) {
    if ($OnlyChapter -and $chapter.id -ne $OnlyChapter) { continue }
    for ($point = 0; $point -lt $chapter.points.Count; $point++) {
      $stem = "$($chapter.id)-$point"
      if ($stem -notmatch '^[a-z0-9-]+$') { throw 'Invalid chapter identifier' }
      $wavePath = Join-Path $workRoot "$stem.wav"
      $outputPath = Join-Path $audioRoot "$stem.m4a"
      $narrator.SetOutputToWaveFile($wavePath)
      $narrator.Speak([string]$chapter.points[$point][1])
      $narrator.SetOutputToNull()
      & ffmpeg -hide_banner -loglevel error -y -i $wavePath -c:a aac -b:a 96k -movflags +faststart $outputPath
      if ($LASTEXITCODE -ne 0) { throw "Audio encoding failed: $stem" }
      $probe = & ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name -of json $outputPath | ConvertFrom-Json
      if ($LASTEXITCODE -ne 0 -or [double]$probe.format.duration -le 0 -or $probe.streams[0].codec_type -ne 'audio') { throw "Invalid narration: $stem" }
      $receipts += [pscustomobject]@{ id=$stem; duration=[double]$probe.format.duration; voice='Microsoft Zira Desktop'; synthetic=$true; text=[string]$chapter.points[$point][1] }
    }
    Write-Output "Narrated $($chapter.id)"
  }
} finally { $narrator.Dispose() }
if ($OnlyChapter) {
  $previous = Get-Content (Join-Path $projectRoot 'evidence/narration-verification.json') -Raw | ConvertFrom-Json
  $receipts = @($previous | Where-Object { $_.id -notlike "$OnlyChapter-*" }) + $receipts
}
$receipts | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $projectRoot 'evidence/narration-verification.json') -Encoding utf8
Write-Output "Verified $($receipts.Count) narration segments."
