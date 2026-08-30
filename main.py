import json

from transcribe import transcribe_audio
from context_analyzer import analyze_context


# Put any supported audio file here
audio_path = "audio/prapti_voice.mp4"


# STEP 2: Convert audio to text
transcript, segments = transcribe_audio(audio_path)


# STEP 3: Analyze the transcript
analysis = analyze_context(transcript)


# STEP 4: Display results
print("\n========== ECHOFORGE ==========")

print("\nTRANSCRIPT:")
print(transcript)


# STEP 5: Display timestamped segments
print("\nTIMESTAMPED SEGMENTS:")

for segment in segments:
    print(
        f'{segment["start"]}s - {segment["end"]}s: '
        f'{segment["text"]}'
    )


print("\nCONTEXT SCORE:")
print(analysis["context_score"])

print("\nRISK LEVEL:")
print(analysis["risk_level"])

if analysis["reasons"]:
    print("\nWHY FLAGGED:")
    for reason in analysis["reasons"]:
        print("-", reason)
else:
    print("\nNO suspicious indicators detected.")


# STEP 6: Save results as JSON
final_output = {
    "original_audio": audio_path,
    "transcript": transcript,
    "segments": segments,
    "context_score": analysis["context_score"],
    "risk_level": analysis["risk_level"],
    "detected": analysis["detected"],
    "reasons": analysis["reasons"]
}


with open("output/result.json", "w", encoding="utf-8") as file:
    json.dump(final_output, file, indent=4)


print("\nResult saved to output/result.json")