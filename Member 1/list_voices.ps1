Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $synth.GetInstalledVoices()
foreach ($v in $voices) {
    Write-Host ($v.VoiceInfo.Name + " | " + $v.VoiceInfo.Gender + " | " + $v.VoiceInfo.Culture + " | " + $v.VoiceInfo.Age)
}
$synth.Dispose()
