import whisper

model_name=input()


model = whisper.load_model(model_name)
transcription_result = model.transcribe("kav1.mp4")
text = transcription_result.get("text", "")
print(text)