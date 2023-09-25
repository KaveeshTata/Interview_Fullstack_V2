import requests
import json

try:
    customer_data = {
    "clientApiKey":"S51M-5V4G-GA1J-MQ5G",
    "modeType" : "Cloud",
    "modelId" : "Model-3",
    "promptId" : "5640",
    "style": "American English in a calm and respectful tone",
    "text": "Arrr, I be fuming that me blender lid flew off and splattered me kitchen walls with smoothie! And to make matters worse, the warranty don't cover the cost of cleaning up me kitchen. I need yer help right now, matey!"
    }
    url = "http://127.0.0.1:5001/llm/server"
    response = requests.post(url, json=customer_data)
    if response.status_code == 200:
        print(response.text)   
    else:
        print("Request was not successful. Status code:", response.status_code)
except Exception as e:
    print(f"Error: {e}")
