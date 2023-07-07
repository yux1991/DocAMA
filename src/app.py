import requests
from flask import Flask, render_template, jsonify, request
from predictor_multiton import SimplePredictorMultiton
from configuration import *
import os, shutil, json
from huggingface_hub import HfApi, ModelFilter


TEMPLATE_FOLDER = '../templates'
STATIC_FOLDER = '../static'
UPLOAD_FOLDER = '../static/uploads'
CONFIG_FOLDER = '../config'
OPENAI_API_KEY = os.environ.get("OPEN_AI_TOKEN")
HUGGINGFACEHUB_API_TOKEN = os.environ.get("HUGGINGFACEHUB_API_TOKEN")

app = Flask(__name__, template_folder=TEMPLATE_FOLDER, static_folder=STATIC_FOLDER)

@app.route('/')
def home():
    return render_template('base.html')

@app.route('/openai_models')
def openai_models():
    model_list_file = os.path.join(CONFIG_FOLDER, 'openai_models.json')
    if os.path.exists(model_list_file):
        model_json = json.load(open(model_list_file, 'r'))
    else:
        model_json = requests.get('https://api.openai.com/v1/models', auth=('Bearer', OPENAI_API_KEY)).json()
        json.dump(model_json, open(model_list_file, 'w'))

    return sorted([js['id'] for js in model_json['data']])

@app.route('/huggingface_models')
def huggingface_models():
    model_list_file = os.path.join(CONFIG_FOLDER, 'huggingface_models.json')
    if os.path.exists(model_list_file):
        model_json = json.load(open(model_list_file, 'r'))
    else:
        api = HfApi()
        models = []
        for aut, name, task in [("lmsys", "vicuna", "text-generation"),
                                ("google", "flan-t5", "text2text-generation"),
                                ("amazon", "LightGPT", "text-generation")]:
            model_list = list(api.list_models(filter=ModelFilter(author=aut, model_name=name, task=task)))
            models = models + [m for m in model_list if m.modelId.startswith(aut)]
        model_json = []
        for m in models:
            d = m.__dict__
            del d['siblings']
            model_json.append(d)
        json.dump(model_json, open(model_list_file, 'w'))
    return sorted([m['modelId'] for m in model_json])

@app.route('/load_model', methods=['POST'])
def load_model():
    if request.method == 'POST':
        request_json = request.get_json()

        model_configuration = LLMConfig(
            platform=request_json['platform'],
            model_name=request_json['model_name'],
            temperature=1e-10
        )

        chain_configuration = ChainConfig(
            chain_name ='Conversation',
            memory_name='ConversationSummaryBuffer',
            prompt_name='standard',
            token_limit=100
        )

        predictor_configuration = PredictorConfig(model_configuration, chain_configuration)

        global PREDICTOR_KEY

        PREDICTOR_KEY = SimplePredictorMultiton.Key(predictor_configuration)

        SimplePredictorMultiton.get_instance(PREDICTOR_KEY)

        return jsonify({'message': 'Model loaded!'})

@app.route('/healthcheck')
def healthcheck():
    return 'OK'

@app.route('/calculate', methods=['POST'])
def calculate():
    # POST request
    if request.method == 'POST':
        message = request.get_json()
        user_input = message['user_input']
        try:
            PREDICTOR_KEY
        except NameError:
            response = jsonify({'alert': 'Please load the LLM model first!'})
        else:
            predictor = SimplePredictorMultiton.get_instance(PREDICTOR_KEY)
            answer = predictor.predict(user_input=user_input)
            response = jsonify({'answer': answer})
        return response

@app.route('/clearmemory', methods=['POST'])
def clear_memory():
    if request.method == 'POST':
        predictor = SimplePredictorMultiton.get_instance(PREDICTOR_KEY)
        predictor.clear_memory()
        return 'Memory cleared'

@app.route('/upload', methods=['POST'])
def upload():
    if request.method == 'POST':
        if 'pdfFile' not in request.files:
            return 'No file uploaded', 400

        pdf_file = request.files['pdfFile']
        filename = pdf_file.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            return 'File already exists'
        else:
            pdf_file.save(filepath)
            return 'File uploaded and processed successfully'

@app.route('/reset', methods=['POST'])
def reset():
    if request.method == 'POST':
        shutil.rmtree(UPLOAD_FOLDER)
        os.makedirs(UPLOAD_FOLDER)
        return 'All uploaded files have been deleted'

if __name__ == "__main__":
    app.run()