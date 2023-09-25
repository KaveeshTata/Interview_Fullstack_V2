from fastapi import FastAPI, HTTPException
from database import *
from stt import *

app = FastAPI()



@app.post("/stt/upload/")
async def upload_file(configdata: dict):
    try:
        clientAPIkey = configdata.get('clientAPIkey')
        print(clientAPIkey)
        video_name = configdata.get('video_name')
        print(video_name)
        mode, model = get_mode_and_model_by_api_key(clientAPIkey)

        if mode and model:
            # Now you have the mode and model, you can proceed with the transcription or translation
            if mode == 'Transcribe':
                text_result = transcribe(model, video_name)
            elif mode == 'Translate':
                text_result = translate(model, video_name)
            print("result: "+text_result)
            return {"result": text_result}

        else:
            raise HTTPException(status_code=404, detail="Invalid API Key")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, port=5003)
