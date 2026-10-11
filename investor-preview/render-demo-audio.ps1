param([string[]]$Only = @())
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$scripts = Get-Content (Join-Path $PSScriptRoot 'demo-scripts.json') -Raw | ConvertFrom-Json
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SelectVoice('Microsoft Zira Desktop')
$voice.Rate = 0
try {
  foreach ($demo in $scripts) {
    if ($Only.Count -gt 0 -and $demo.id -notin $Only) { continue }
    $dir = Join-Path $PSScriptRoot ".video-work/actual/$($demo.id)"
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    for ($i=0; $i -lt $demo.steps.Count; $i++) {
      $wave = Join-Path $dir "$i.wav"
      $voice.SetOutputToWaveFile($wave)
      $voice.Speak([string]$demo.steps[$i].text)
      $voice.SetOutputToNull()
    }
    Write-Output "Demo narration ready: $($demo.id)"
  }
} finally { $voice.Dispose() }
