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

load_dotenv()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load trained SVM model and scaler
model = pickle.load(open('svm_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

# Configure Gemini API
# Get API key from .env
api_key = os.getenv("GENAI_API_KEY")

if not api_key:
    raise ValueError("❌ API Key not found. Make sure .env is set up correctly.")

# Configure GenAI
genai.configure(api_key=api_key)


# Define the secret token (store securely in production)
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


        if not response.text:
            return []

        # Remove Markdown-style code block markers
        clean_text = re.sub(r"```json\n|\n```", "", response.text.strip())

        # Parse JSON after cleanup
        extracted_numbers = json.loads(clean_text)

        return extracted_numbers

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parsing Failed: {e}. Falling back to regex extraction.")
        return []  # Fallback if needed

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
            return jsonify({'error': 'Unauthorized'}), 403

        int_features = []

        # File upload option
        if 'file' in request.files and request.files['file'].filename:
            file = request.files['file']
            file_bytes = file.read()  # Read file as bytes

            # Process PDF using Gemini
            int_features = process_pdf_with_gemini(file_bytes)


        if not int_features:
            return jsonify({'error': 'No valid numerical values extracted'}), 400

        # Convert to NumPy array and preprocess
        final = np.array(int_features).reshape(1, -1)
        final_scaled = scaler.transform(final)

        # Predict using SVM model
        output = model.predict(final_scaled)[0]

        return render_template(
            'risky.html' if output == 1 else 'norisk.html',
            pred='⚠ High Risk: Malignant Detected' if output == 1 else '✅ Low Risk: No Cancer Detected'
        )

    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/upload_report', methods=['POST'])
def upload_report():
    return upload_file()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
