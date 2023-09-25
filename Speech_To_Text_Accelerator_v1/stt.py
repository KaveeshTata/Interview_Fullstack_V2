import whisper


def transcribe(model_type,input_file):
    model = whisper.load_model(model_type)
    transcription_result = model.transcribe(input_file)
    text = transcription_result.get("text", "")
    return text


def translate(model_type,input_file):
    model = whisper.load_model(model_type)
    audio = whisper.load_audio(input_file)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    _, probs = model.detect_language(mel)
    print(f"Detected language: {max(probs, key=probs.get)}")
    options = whisper.DecodingOptions(fp16 = False)
    result = whisper.decode(model, mel, options)
    return result.text


