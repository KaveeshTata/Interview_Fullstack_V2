import yaml
from flask import Flask, request, jsonify, render_template
import json
import openai
from dotenv import load_dotenv, find_dotenv
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
import random
import string
import sqlite3


yaml_file_path = 'config.yml'


with open(yaml_file_path, 'r') as yaml_file:
    modelsdata = yaml.safe_load(yaml_file)



app = Flask(__name__)
chat = None
prompt = None
mode = None
clientApiKey = None
modelId = None
modelType = None
engine = None

connection = sqlite3.connect('mydatabase.db')

cursor = connection.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS clientApiKeys
               (
               sno INTEGER PRIMARY KEY AUTOINCREMENT, 
               clientApiKeys TEXT UNIQUE,
               email TEXT
               )''')
        
connection.commit()

cursor.execute('''CREATE TABLE IF NOT EXISTS modelIds
               (
               sno INTEGER PRIMARY KEY AUTOINCREMENT, 
               clientApiKey TEXT, 
               modeType TEXT, 
               modelIds TEXT
               )''')

connection.commit()

cursor.execute('''CREATE TABLE IF NOT EXISTS promptTemplates
               (
               sno INTEGER PRIMARY KEY AUTOINCREMENT, 
               clientApiKey TEXT, 
               promptId TEXT, 
               prompt TEXT
               )''')
        
connection.commit()

def generate_api_key(length, chunk_size):
    characters = string.ascii_uppercase + string.digits
    api_key = ''.join(random.choice(characters) for _ in range(length))
    
    # Insert hyphens after every chunk_size characters
    api_key_with_hyphens = '-'.join(api_key[i:i+chunk_size] for i in range(0, len(api_key), chunk_size))
    
    return api_key_with_hyphens

def generate_prompt_id(length):
    characters = string.digits
    promptId = ''.join(random.choice(characters) for _ in range(length))

    return promptId

def load_model(device_type, model_id, model_basename=None):
    if model_basename is not None:
        if ".ggml" in model_basename:
            model_path = hf_hub_download(repo_id = model_id, filename = model_basename)
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
                    model = model,
                    tokenizer = tokenizer,
                    max_length = 2048,
                    temperature = 0,
                    top_p = 0.95,
                    repetition_penalty = 1.15,
                    generation_config = generation_config,
                   )
    local_llm = HuggingFacePipeline(pipeline = pipe)
    
    return local_llm

def setupModel(modeType, modelId):
    global chat, engine
    if (modeType == 'Local'):
        modelName = modelsdata['models'][modeType][modelId]['Model-Name']
        modelName = modelName+'.ggmlv3.q4_1.bin'

        if(modelName == "llama-2-7b-chat.ggmlv3.q4_1.bin"):
            model_id = "TheBloke/Llama-2-7B-Chat-GGML"
        elif(modelName == "llama-2-70b-chat.ggmlv3.q4_1.bin"):
            model_id = "TheBloke/Llama-2-70B-Chat-GGML"

        DEVICE_TYPE = "cuda" if torch.cuda.is_available() else "cpu"
        SHOW_SOURCES = True
        LLM = load_model(DEVICE_TYPE, model_id, modelName)

        chat = LLM
    elif (modeType == 'Cloud'):
        modelName = modelsdata['models'][modeType][modelId]['Model-Name']
        if modelName == "OpenAI":
            engine = modelsdata['models'][modeType][modelId]['Engine']
            openai.api_key = os.environ.get("OPEN_API_KEY")
            chat = ChatOpenAI(temperature=0.0, model=engine)
        

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/config.yml', methods=['GET'])
def get_config():
    with open('config.yml', 'r') as yaml_file:
        yaml_data = yaml_file.read()
    return yaml_data, 200


@app.route('/llm/output', methods = ['GET', 'POST'])
def output():
    try:
        global chat, prompt, mode, modelId, modelType, engine
        
        json_data = request.get_json()

        prompt = json_data['prompt']
        modeType = json_data['modeType']
        modelId = json_data['modelId']

        setupModel(modeType,modelId)

        prompt_template = ChatPromptTemplate.from_template(prompt)
        inputs = prompt_template.messages[0].prompt.input_variables
        for key in inputs:
            if key in json_data:
                print(json_data[key])
                globals()[key] = json_data[key]

        prompt = prompt_template.format_messages(**json_data)
        if modeType == "Cloud":
            response = chat(prompt)
            response = response.content
        else:
            response = chat(prompt[0].content)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/llm/addPrompt', methods = ['POST', 'GET'])
def addPrompt():
    try:
        json_data = request.get_json()

        prompt = json_data['prompt']
        clientApiKey = json_data['clientApiKey']  

        emailId = 'brillius@gmail.com'

        connection = sqlite3.connect('mydatabase.db')

        cursor = connection.cursor()

        query = "SELECT promptId FROM promptTemplates WHERE clientApiKey = ? AND prompt = ?"
        cursor.execute(query, (clientApiKey, prompt,))
        promptId = cursor.fetchall()

        if len(promptId) == 0:
            promptId = generate_prompt_id(4)
            cursor.execute("INSERT INTO promptTemplates (clientApiKey, promptId, prompt) VALUES (?, ?, ?)",
                           (clientApiKey, promptId, prompt))
            connection.commit()
        else:
            promptId = promptId[0][0]

        return "Prompt Added Successfully\n Client API KEY: "+clientApiKey+"\n Prompt ID: "+promptId
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
    
@app.route('/llm/addModelId', methods = ['POST', 'GET'])
def addModelId():
    try:
        json_data = request.get_json()

        modelId = json_data['modelId']
        modeType = json_data['modeType']
        clientApiKey = json_data['clientApiKey']

        emailId = 'brillius@gmail.com'

        connection = sqlite3.connect('mydatabase.db')

        cursor = connection.cursor()

        if(clientApiKey == ""):
            clientApiKey = generate_api_key(16,4)
            cursor.execute("INSERT INTO clientApiKeys (clientApiKeys, email) VALUES (?, ?)",
                           (clientApiKey, emailId))
            connection.commit()

        query = "SELECT modelIds FROM modelIds WHERE clientApiKey = ? AND modeType = ?"
        cursor.execute(query, (clientApiKey, modeType,))
        modelFlag = cursor.fetchall()

        if len(modelFlag) == 0:
            cursor.execute("INSERT INTO modelIds (clientApiKey, modeType, modelIds) VALUES (?, ?, ?)",
                           (clientApiKey, modeType, modelId))
            connection.commit()
        return "Model Added Successfully\n Client API KEY: "+clientApiKey+"\n Model ID: "+modelId
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
    
@app.route('/llm/clientApiKeys', methods = ['POST', 'GET'])
def clientApiKeys():
    connection = sqlite3.connect('mydatabase.db')
    cursor = connection.cursor()

    query = "SELECT clientApiKeys FROM clientApiKeys"
    cursor.execute(query)
    clientApiKeys = cursor.fetchall()
    connection.close()

    return jsonify(clientApiKeys)

@app.route('/llm/modelIds', methods = ['POST', 'GET'])
def modelIds():
    clientApiKey = request.args.get('clientApiKey')
    
    connection = sqlite3.connect('mydatabase.db')
    cursor = connection.cursor()

    query = "SELECT modelIds FROM modelIds WHERE clientApiKey = ?"
    cursor.execute(query, (clientApiKey,))
    modelIds = cursor.fetchall()

    connection.close()

    return jsonify(modelIds)

@app.route('/llm/modeType', methods = ['POST', 'GET'])
def modeType():
    clientApiKey = request.args.get('clientApiKey')
    modelId = request.args.get('modelId')

    connection = sqlite3.connect('mydatabase.db')
    cursor = connection.cursor()

    query = "SELECT modeType FROM modelIds WHERE clientApiKey = ? AND modelIds = ?"
    cursor.execute(query, (clientApiKey,modelId,))
    modeType = cursor.fetchall()

    connection.close()

    return jsonify(modeType)

@app.route('/llm/promptIds', methods = ['POST', 'GET'])
def promptId():
    clientApiKey = request.args.get('clientApiKey')

    connection = sqlite3.connect('mydatabase.db')
    cursor = connection.cursor()

    query = "SELECT promptId FROM promptTemplates WHERE clientApiKey = ?"
    cursor.execute(query, (clientApiKey,))
    promptId = cursor.fetchall()

    connection.close()

    return jsonify(promptId)

@app.route('/llm/prompt', methods = ['POST', 'GET'])
def prompt():
    clientApiKey = request.args.get('clientApiKey')
    promptId = request.args.get('promptId')

    connection = sqlite3.connect('mydatabase.db')
    cursor = connection.cursor()

    query = "SELECT prompt FROM promptTemplates WHERE clientApiKey = ? AND promptId = ?"
    cursor.execute(query, (clientApiKey, promptId,))
    prompt = cursor.fetchall()

    connection.close()

    return jsonify(prompt)
        
    
if __name__ == '__main__':
    app.run(debug=True, port=5005)
