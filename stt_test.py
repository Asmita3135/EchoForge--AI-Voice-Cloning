import whisper  # type: ignore[import-untyped]

model = whisper.load_model("tiny")

result = model.transcribe("audio/Training.wav")

print("TRANSCRIPT:")
print(result["text"])