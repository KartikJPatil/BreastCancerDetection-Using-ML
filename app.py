from flask import Flask, render_template, request
import pickle
import numpy as np

app = Flask(__name__)

# Load updated model
model = pickle.load(open('model1.pkl', 'rb'))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    int_features = [float(x) for x in request.form.values()]
    final = np.array(int_features).reshape(1, -1)  # Fix input shape
    output = model.predict(final)

    if output[0] == 1:
        return render_template('risky.html', pred='High Risk')
    else:
        return render_template('norisk.html', pred='Low Risk')

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001, debug=True)
