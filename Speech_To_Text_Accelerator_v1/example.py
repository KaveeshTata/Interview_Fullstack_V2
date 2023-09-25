import requests
import json

try:
    configdata={
    "clientAPIkey": "Z46I-CMFJ-3TC2-9SCT",
    "video_name": "kav1.mp4"
}
    url = "http://127.0.0.1:5003/stt/upload"
    response = requests.post(url, json=configdata)
    if response.status_code == 200:
        transcribed_text = response.json()["result"] 
        print(transcribed_text)
    else:
        transcribed_text = ""
        print("Request was not successful. Status code:", response.status_code)
except Exception as e:
    print(f"Error: {e}")