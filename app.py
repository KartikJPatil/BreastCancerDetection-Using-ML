from flask import Flask, request, jsonify, render_template
import os
import pickle
import numpy as np
import google.generativeai as genai
import re
import json
from flask_cors import CORS
from dotenv import load_dotenv

# ================= ENV SETUP =================
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

api_key = os.getenv("GENAI_API_KEY")

if not api_key:
    raise ValueError("API Key not found. Set GENAI_API_KEY in environment variables.")

print("Loaded API Key:", api_key[:5] + "********")

# ================= FLASK APP =================
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ================= LOAD MODEL =================
model = pickle.load(open('svm_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

print(f"Model Loaded: {type(model)}")
print(f"Scaler Loaded: {type(scaler)}")

# ================= GEMINI SETUP =================
genai.configure(api_key=api_key)

SECRET_TOKEN = "acbcdefghijklmnopqrstu"

# ================= GEMINI FUNCTION =================
def process_pdf_with_gemini(file_bytes):
    model_gemini = genai.GenerativeModel("gemini-1.5-flash")

    try:
        pdf_data = {
            "mime_type": "application/pdf",
            "data": file_bytes
        }

        prompt = """
        Extract ONLY the numerical values from the 'OBSERVED VALUE' column in this medical report.
        Return them as a simple JSON array of numbers in this exact format: [1,2,3,4,5,6,7,8,9]

        If you cannot find exactly 9 values, return []
        """

        response = model_gemini.generate_content([pdf_data, prompt])

        if not response.text:
            return []

        clean_text = response.text.strip()

        clean_text = re.sub(r"```json\s*", "", clean_text)
        clean_text = re.sub(r"```", "", clean_text)

        try:
            data = json.loads(clean_text)

            if isinstance(data, list) and len(data) == 9:
                return [float(x) for x in data]

        except:
            numbers = re.findall(r'\d+\.?\d*', clean_text)
            if len(numbers) == 9:
                return [float(x) for x in numbers]

        return []

    except Exception as e:
        print("Gemini Error:", e)
        return []

# ================= ROUTES =================
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        token = request.headers.get('Authorization')
        if token != f"Bearer {SECRET_TOKEN}":
            return jsonify({'error': 'Unauthorized'}), 403

        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        file_bytes = file.read()

        features = process_pdf_with_gemini(file_bytes)

        if len(features) != 9:
            return jsonify({'error': 'Invalid data extracted'}), 400

        final = np.array(features).reshape(1, -1)
        final_scaled = scaler.transform(final)

        probability = model.predict_proba(final_scaled)[:, 1] * 100
        output = 1 if probability[0] >= 50 else 0

        return jsonify({
            "success": True,
            "prediction": "High Risk" if output == 1 else "Low Risk",
            "risk_score": round(probability[0], 2)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================= MAIN =================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
