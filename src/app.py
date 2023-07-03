from flask import Flask, render_template, jsonify, request
from multiton import SimplePredictorMultiton
from configuration import PredictorConfig
import os, shutil


MODEL_CONFIGURATION = PredictorConfig('test')
MODEL_KEY = SimplePredictorMultiton.Key(MODEL_CONFIGURATION)
TEMPLATE_FOLDER = '../templates'
STATIC_FOLDER = '../static'
UPLOAD_FOLDER = '../static/uploads'

app = Flask(__name__, template_folder=TEMPLATE_FOLDER, static_folder=STATIC_FOLDER)

@app.route('/')
def home():
    return render_template('base.html')

@app.route('/healthcheck')
def healthcheck():
    return 'OK'

@app.route('/calculate', methods=['POST'])
def calculate():
    # POST request
    if request.method == 'POST':
        message = request.get_json()
        user_input = message['user_input']
        predictor = SimplePredictorMultiton.get_instance(MODEL_KEY)
        answer = predictor.predict(user_input=user_input)
        response = jsonify({'answer': answer})
        return response

@app.route('/clearmemory', methods=['POST'])
def clear_memory():
    if request.method == 'POST':
        predictor = SimplePredictorMultiton.get_instance(MODEL_KEY)
        predictor.clear_memory()
        response = jsonify({'status': 'SUCCESS'})
        return response

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