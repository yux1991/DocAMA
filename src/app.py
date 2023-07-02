from flask import Flask, render_template, jsonify, request
from multiton import SimplePredictorMultiton
from configuration import PredictorConfig

app = Flask(__name__, template_folder='../templates', static_folder='../static')
model_configuration = PredictorConfig('test')
model_key = SimplePredictorMultiton.Key(model_configuration)

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
        predictor = SimplePredictorMultiton.get_instance(model_key)
        answer = predictor.predict(user_input=user_input)
        response = jsonify({'answer': answer})
        return response

@app.route('/clearmemory', methods=['POST'])
def clear_memory():
    if request.method == 'POST':
        predictor = SimplePredictorMultiton.get_instance(model_key)
        predictor.clear_memory()
        response = jsonify({'status': 'SUCCESS'})
        return response

if __name__ == "__main__":
    app.run()