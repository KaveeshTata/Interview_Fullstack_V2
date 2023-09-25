from fastapi import FastAPI
import openai
import os
import torch
from auto_gptq import AutoGPTQForCausalLM
from langchain.chains import RetrievalQA
from huggingface_hub import hf_hub_download
from langchain.llms import HuggingFacePipeline, LlamaCpp
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    GenerationConfig,
    LlamaForCausalLM,
    LlamaTokenizer,
    pipeline,
)
from werkzeug.utils import secure_filename
from chromadb.config import Settings
import sqlite3
import yaml
app = FastAPI()

yaml_file_path = 'config.yml'

with open(yaml_file_path, 'r') as yaml_file:
    modelsdata = yaml.safe_load(yaml_file)

chat = None

def load_model(device_type, model_id, model_basename=None):
    if model_basename is not None:
        if ".ggml" in model_basename:
            model_path = hf_hub_download(repo_id=model_id, filename=model_basename)
            max_ctx_size = 2048
            kwargs = {
                "model_path": model_path,
                "n_ctx": max_ctx_size,
                "max_tokens": max_ctx_size,
            }
            if device_type.lower() == "mps":
                kwargs["n_gpu_layers"] = 1000
            if device_type.lower() == "cuda":
                kwargs["n_gpu_layers"] = 1000
                kwargs["n_batch"] = max_ctx_size
            return LlamaCpp(**kwargs)
    
    generation_config = GenerationConfig.from_pretrained(model_id)
    pipe = pipeline("text-generation",
                    model=model,
                    tokenizer=tokenizer,
                    max_length=2048,
                    temperature=0,
                    top_p=0.95,
                    repetition_penalty=1.15,
                    generation_config=generation_config,
                   )
    local_llm = HuggingFacePipeline(pipeline=pipe)
    
    return local_llm

DEVICE_TYPE = "cuda" if torch.cuda.is_available() else "cpu"
SHOW_SOURCES = True

openai.api_key = os.environ.get("OPEN_API_KEY")
print(openai.api_key)

Local_Model1 = load_model(device_type=DEVICE_TYPE, model_id="TheBloke/Llama-2-7B-Chat-GGML", model_basename="llama-2-7b-chat.ggmlv3.q4_1.bin")
Cloud_Model3 = ChatOpenAI(temperature=0.0, model='gpt-3.5-turbo')

print(Local_Model1)
print(Cloud_Model3)

@app.post('/llm/server')
async def output(json_data: dict):
    global chat

    clientApiKey = json_data['clientApiKey']
    modelId = json_data['modelId']
    modeType = json_data['modeType']
    promptId = json_data['promptId']

    if modeType == 'Local':
        if modelId == 'Model-1':
            chat = Local_Model1
    elif modeType == 'Cloud':
        if modelId == 'Model-3':
            chat = Cloud_Model3

    connection = sqlite3.connect('mydatabase.db')
    cursor = connection.cursor()

    query = "SELECT prompt FROM promptTemplates WHERE clientApiKey = ? and promptId = ?"
    cursor.execute(query, (clientApiKey, promptId,))
    promptData = cursor.fetchall()
    prompt = promptData[0][0]
    connection.close()

    prompt_template = ChatPromptTemplate.from_template(prompt)
    inputs = prompt_template.messages[0].prompt.input_variables

    for key in inputs:
        if key in json_data:
            globals()[key] = json_data[key]

    prompt = prompt_template.format_messages(**json_data)
    print(prompt)
    content = prompt[0].content
    input = content.encode('utf-8')
    prompt[0].content = input.decode('utf')
    print(prompt)
    if modeType == "Cloud":
        response = chat(prompt)
        response = response.content
        output = response.replace('\n','')
    else:
        flag = 0
        while(flag <= 3):
            response = chat(prompt[0].content)
            if(response != None):
                flag = flag + 1
            else:
                break
        output = response.replace('\n','')

    return output

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, port=5002)
