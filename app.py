from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)

# Load trained SVM model and scaler
model = pickle.load(open('svm_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

@app.route('/')
def home():
    return render_template('index.html')  # Create 'index.html' for input form

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input values from the form
        int_features = [float(x) for x in request.form.values()]
        final = np.array(int_features).reshape(1, -1)

        # Apply the same scaling as used during training
        final_scaled = scaler.transform(final)

        # Predict using the trained SVM model
        output = model.predict(final_scaled)[0]

        # Return appropriate result
        if output == 1:
            return render_template('risky.html', pred='⚠ High Risk: Malignant Detected')
        else:
            return render_template('norisk.html', pred='✅ Low Risk: No Cancer Detected')

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001, debug=True)
