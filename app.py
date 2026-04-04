from flask import Flask, request, jsonify, render_template
import os
import pickle
import numpy as np
import google.generativeai as genai
import re
import json
from flask_cors import CORS
from dotenv import load_dotenv

# ================= ENV =================
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

api_key = os.getenv("GENAI_API_KEY")
if not api_key:
    raise ValueError("❌ API Key not found.")

print("🔑 Loaded API Key:", api_key[:5] + "********")

# ================= APP =================
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ================= MODEL =================
model = pickle.load(open('svm_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

print(f"Model Loaded: {model}")
print(f"Scaler Loaded: {scaler}")

# ================= GEMINI =================
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

        response = model_gemini.generate_content([
            pdf_data,
            "Extract ONLY 9 numerical values from OBSERVED VALUE column in JSON format: [1,2,3,4,5,6,7,8,9]"
        ])

        if not response.text:
            return []

        clean_text = re.sub(r"```json\n|\n```", "", response.text.strip())

        try:
            data = json.loads(clean_text)
            if isinstance(data, list):
                return data
        except:
            pass

        # fallback regex
        numbers = re.findall(r'\d+\.?\d*', clean_text)
        return [float(x) for x in numbers]

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

        if 'file' not in request.files or request.files['file'].filename == '':
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        file_bytes = file.read()

        int_features = process_pdf_with_gemini(file_bytes)

        print("🔢 Extracted Features:", int_features)

        # ✅ FIX: validate features BEFORE reshape
        if not int_features or len(int_features) != 9:
            return jsonify({
                "error": f"Invalid extracted data. Expected 9 values, got {len(int_features)}"
            }), 400

        try:
            final = np.array(int_features, dtype=float).reshape(1, -1)
        except Exception as e:
            return jsonify({"error": f"Array reshape error: {str(e)}"}), 500

        print("📊 Input Shape:", final.shape)

        # Scale
        try:
            final_scaled = scaler.transform(final)
        except Exception as e:
            return jsonify({"error": f"Scaling error: {str(e)}"}), 500

        # Predict
        try:
            probability = model.predict_proba(final_scaled)[:, 1] * 100
            output = 1 if probability[0] >= 50 else 0
            risk_score = round(probability[0], 2)

            return jsonify({
                "success": True,
                "pred": "⚠ High Risk: Malignant Detected" if output == 1 else "✅ Low Risk: No Cancer Detected",
                "risk_score": risk_score,
                "output": output
            })

        except Exception as e:
            return jsonify({"error": f"Prediction error: {str(e)}"}), 500

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/upload_report', methods=['POST'])
def upload_report():
    return upload_file()


@app.route('/blog')
def blog():
    return render_template('blogs.html')


@app.route('/self-examination')
def self_examination():
    return render_template('self_exam.html')


@app.route('/ai_detection')
def ai_detection():
    return render_template('ai_detection.html')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
