import whisper  # type: ignore[import-untyped]

model = whisper.load_model("base")


def transcribe_audio(audio_path):
    result = model.transcribe(audio_path)

    transcript = result["text"].strip()

    segments = []

    for segment in result["segments"]:
        segments.append({
            "start": round(segment["start"], 2),
            "end": round(segment["end"], 2),
            "text": segment["text"].strip()
        })

    return transcript, segments
