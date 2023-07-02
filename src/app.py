from flask import Flask, render_template, jsonify, request
from multiton import SimplePredictorMultiton
from configuration import PredictorConfig

app = Flask(__name__, template_folder='../templates', static_folder='../static')

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
        configuration = PredictorConfig('test')
        key = SimplePredictorMultiton.Key(configuration)
        predictor = SimplePredictorMultiton.get_instance(key)
        answer = predictor.predict(user_input=user_input)
        response = jsonify({'answer': answer})
        return response

if __name__ == "__main__":
    app.run()