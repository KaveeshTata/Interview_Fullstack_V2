from flask import Flask, render_template, request, redirect, url_for, jsonify
from database import *
import string 
import random
app = Flask(__name__)


def generate_api_key(length, chunk_size):
    characters = string.ascii_uppercase + string.digits
    api_key = ''.join(random.choice(characters) for _ in range(length))
    
    # Insert hyphens after every chunk_size characters
    api_key_with_hyphens = '-'.join(api_key[i:i+chunk_size] for i in range(0, len(api_key), chunk_size))
    
    return api_key_with_hyphens

# Define routes and view functions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_config', methods=['POST'])
def add_config():
    mode = request.json.get('mode')
    model = request.json.get('model')

    # Assuming 'brillius@gmail.com' is the hardcoded email
    registered_email = "brillius@gmail.com"

    # Generate API Key (assuming the function is in app.py)
    clientAPIkey = generate_api_key(16, 4)

    # Create ClientInfo entry
    create_client_info(clientAPIkey, registered_email)

    # Create ModelInfo entry
    create_model_info(clientAPIkey, mode, model)

    return jsonify({'api_key': clientAPIkey, 'mode': mode, 'model': model})

@app.route('/get_api_keys')
def get_api_keys():
    api_keys = [client.clientAPIkey for client in session.query(ClientInfo).all()]
    return jsonify({'api_keys': api_keys})

@app.route('/update_config', methods=['POST'])
def update_config():
    apiKey = request.json.get('apiKey')
    mode = request.json.get('mode')
    model = request.json.get('model')

    # Update ModelInfo entry
    update_model_name(apiKey, mode, model)

    return jsonify({'apiKey': apiKey, 'mode': mode, 'model': model})

if __name__ == '__main__':
    app.run(port= 5010,debug=True)
