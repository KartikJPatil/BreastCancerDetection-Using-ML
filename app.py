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
    raise ValueError("API Key not found. Make sure .env is set up correctly.")

print("Loaded API Key:", api_key[:5] + "********") 

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load trained SVM model and scaler
model = pickle.load(open('svm_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

print(f"Model Loaded: {type(model)}")
print(f"Scaler Loaded: {type(scaler)}")

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

        prompt = """
        Extract ONLY the numerical values from the 'OBSERVED VALUE' column in this medical report.
        Return them as a simple JSON array of numbers in this exact format: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        
        The report should contain 9 numerical values for these features:
        1. Clump Thickness
        2. Uniformity of Cell Size
        3. Uniformity of Cell Shape
        4. Marginal Adhesion
        5. Single Epithelial Cell Size
        6. Bare Nuclei
        7. Bland Chromatin
        8. Normal Nucleoli
        9. Mitoses
        
        If you cannot find exactly 9 values, return an empty array: []
        Do not include any other text, just the JSON array.
        """

        response = model.generate_content([pdf_data, prompt])

        print("Raw Gemini API Response:", response.text)

        if not response.text:
            print("No response received from Gemini API")
            return []

        clean_text = response.text.strip()
        
        # Remove markdown code blocks if present
        clean_text = re.sub(r"```json\s*", "", clean_text)
        clean_text = re.sub(r"```\s*", "", clean_text)
        clean_text = clean_text.strip()
        
        print("Cleaned Gemini Response:", clean_text)

        # Try to parse JSON
        try:
            extracted_numbers = json.loads(clean_text)
            
            # Validate it's a list of numbers
            if isinstance(extracted_numbers, list) and len(extracted_numbers) == 9:
                extracted_numbers = [float(x) for x in extracted_numbers]
                print(f"Extracted {len(extracted_numbers)} Numbers:", extracted_numbers)
                return extracted_numbers
            else:
                print(f"Expected 9 values, got {len(extracted_numbers) if isinstance(extracted_numbers, list) else 'invalid format'}")
                return []
                
        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON Parsing Failed: {e}")
            # Fallback: Try to extract numbers using regex
            numbers = re.findall(r'\d+\.?\d*', clean_text)
            if len(numbers) == 9:
                extracted_numbers = [float(x) for x in numbers]
                print(f"Regex Extracted {len(extracted_numbers)} Numbers:", extracted_numbers)
                return extracted_numbers
            else:
                print(f"Regex found {len(numbers)} numbers, expected 9")
                return []

    except Exception as e:
        app.logger.error(f"Error processing PDF with Gemini: {e}")
        import traceback
        traceback.print_exc()
        return []

    
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ai_detection')
def ai_detection():
    return render_template('ai_detection.html')

@app.route('/blog')
def blog():
    return render_template('blogs.html')

@app.route('/self-examination')
def self_examination():
    return render_template('self_exam.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        print("\n" + "="*60)
        print("UPLOAD REQUEST RECEIVED")
        print("="*60)
        
        # Authorization check
        token = request.headers.get('Authorization')
        if token != f"Bearer {SECRET_TOKEN}":
            print("Unauthorized access attempt")
            return jsonify({
                'success': False,
                'error': 'Unauthorized access'
            }), 403

        int_features = []

        # File upload handling
        if 'file' not in request.files:
            print("No file in request")
            return jsonify({
                'success': False,
                'error': 'No file uploaded'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            print("Empty filename")
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        print(f"File received: {file.filename}")
        
        # Read file bytes
        file_bytes = file.read()
        print(f"File size: {len(file_bytes)} bytes")

        # Process PDF using Gemini
        print("Processing with Gemini AI...")
        int_features = process_pdf_with_gemini(file_bytes)

        print(f"Extracted Features: {int_features}")

        # Validate extracted features
        if not int_features or len(int_features) != 9:
            print(f"Invalid feature count: {len(int_features) if int_features else 0}")
            return jsonify({
                'success': False,
                'error': f'Could not extract valid data from the file. Expected 9 features, got {len(int_features) if int_features else 0}. Please ensure the PDF contains a valid BRCA1/BRCA2 test report with all required fields.'
            }), 400

        # Convert to NumPy array and preprocess
        final = np.array(int_features).reshape(1, -1)
        print(f"Input Array Shape: {final.shape}")
        print(f"Input Values: {final}")

        # Scale the features
        try:
            final_scaled = scaler.transform(final)
            print(f"Features scaled successfully")
            print(f"Scaled Values: {final_scaled}")
        except Exception as e:
            print(f"Scaling error: {e}")
            return jsonify({
                'success': False,
                'error': f'Error processing features: {str(e)}'
            }), 500

        # Predict using SVM model
        try:
            probability = model.predict_proba(final_scaled)[:, 1] * 100
            output = 1 if probability[0] >= 50 else 0
            risk_score = round(probability[0], 2)

            print(f"\n{'='*60}")
            print(f"PREDICTION RESULTS")
            print(f"{'='*60}")
            print(f"Risk Score: {risk_score}%")
            print(f"Output: {output} ({'High Risk' if output == 1 else 'Low Risk'})")
            print(f"{'='*60}\n")

            return jsonify({
                "success": True,
                "pred": "High Risk: Malignant Detected" if output == 1 else "Low Risk: No Cancer Detected",
                "risk_score": risk_score,
                "output": output
            })
        
        except Exception as e:
            print(f"Prediction error: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'error': f'Prediction failed: {str(e)}'
            }), 500

    except Exception as e:
        print(f"\nUNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'An unexpected error occurred: {str(e)}'
        }), 500


@app.route('/upload_report', methods=['POST'])
def upload_report():
    return upload_file()


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
</parameter>
