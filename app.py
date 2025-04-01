from flask import Flask, request, jsonify, render_template
import os
import pickle
import numpy as np
import google.generativeai as genai
import io
from werkzeug.utils import secure_filename
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS
from dotenv import load_dotenv
import json
import re

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

api_key = os.getenv("GENAI_API_KEY")
if not api_key:
    raise ValueError("❌ API Key not found. Make sure .env is set up correctly.")

print("🔑 Loaded API Key:", api_key[:5] + "********") 

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load trained SVM model and scaler
model = pickle.load(open('svm_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

print(f"Model Loaded: {model}")  # Check if the model loaded properly
print(f"Scaler Loaded: {scaler}")  # Check if the scaler loaded properly

# Configure Gemini API
genai.configure(api_key=api_key)

SECRET_TOKEN = "acbcdefghijklmnopqrstu"

def process_pdf_with_gemini(file_bytes):
    """Processes a PDF file with Gemini to extract numerical values under 'OBSERVED VALUE'."""
    model = genai.GenerativeModel("gemini-1.5-flash")

    try:
        pdf_data = {
            "mime_type": "application/pdf",
            "data": file_bytes
        }

        response = model.generate_content([
            pdf_data,
            "List out only the numerical values under the 'OBSERVED VALUE' column in **valid JSON format**: [num1, num2, num3, ...]"
        ])

        print("🔍 Raw Gemini API Response:", response.text)  # Debugging print

        if not response.text:
            print("❌ No response received from Gemini API")
            return []

        clean_text = re.sub(r"```json\n|\n```", "", response.text.strip())
        print("📜 Cleaned Gemini Response:", clean_text)  # Debugging print

        extracted_numbers = json.loads(clean_text)

        print("✅ Extracted Numbers:", extracted_numbers)  # Debugging print
        return extracted_numbers

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parsing Failed: {e}. Falling back to regex extraction.")
        return []

    except Exception as e:
        app.logger.error(f"Error processing PDF with Gemini: {e}")
        return []
    
    
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Authorization check
        token = request.headers.get('Authorization')
        if token != f"Bearer {SECRET_TOKEN}":
            print("❌ Unauthorized access attempt")
            return jsonify({'error': 'Unauthorized'}), 403

        int_features = []

        # File upload handling
        if 'file' in request.files and request.files['file'].filename:
            file = request.files['file']
            file_bytes = file.read()

            # Process PDF using Gemini
            int_features = process_pdf_with_gemini(file_bytes)

        print("🔢 Extracted Features:", int_features)  # Debugging print

        

        # Convert to NumPy array and preprocess
        final = np.array(int_features).reshape(1, -1)
        print("📊 Input Array Shape:", final.shape)  # Debugging print

        final_scaled = scaler.transform(final)

        # Predict using SVM model
        probability = model.predict_proba(final_scaled)[:, 1] * 100  # Get probability as a percentage
        output = 1 if probability[0] >= 50 else 0  # Threshold at 50%
        risk_score = round(probability[0], 2)  # Round to 2 decimal places

        print(risk_score)
        return render_template(
            'risky.html' if output == 1 else 'norisk.html',
            pred='⚠ High Risk: Malignant Detected' if output == 1 else '✅ Low Risk: No Cancer Detected'
        )
        

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)})


@app.route('/upload_report', methods=['POST'])
def upload_report():
    return upload_file()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
