# Breast Cancer Detection Using Machine Learning

This project is an implementation of a breast cancer detection system using machine learning models. It predicts the risk of breast cancer based on specific gene attributes such as BRCA1 and BRCA2, and recommends nearby doctors if the risk is high.

## 🧬 Project Overview

- **Goal**: Predict breast cancer risk using machine learning algorithms.
- **Input**: Gene marker values (e.g., BRCA1, BRCA2).
- **Output**: Risk score (percentage) and doctor recommendation.
- **Technologies Used**:
  - Python
  - Scikit-learn
  - Streamlit (optional, for UI)
  - Google Gemini API (for document extraction)

## 📂 Project Structure

\`\`\`
.
├── data/                 # CSV dataset files
├── models/               # Saved ML models (e.g., svm_model.pkl, scaler.pkl)
├── app.py                # Streamlit web app (if applicable)
├── svm.py                # Training script for SVM model
├── requirements.txt      # Dependencies
├── README.md             # Project documentation
\`\`\`

## ⚙️ Features

✅ Upload gene test reports (PDF, DOCX, etc.)  
✅ Extract gene values automatically using Gemini API  
✅ Preprocess input data  
✅ Predict cancer risk with trained ML models  
✅ Show risk score as a percentage  
✅ Recommend nearby doctors based on location (optional)

## 🚀 How to Run

1. **Clone the Repository**

   \`\`\`bash
   git clone https://github.com/KartikJPatil/BreastCancerDetection-Using-ML.git
   cd BreastCancerDetection-Using-ML
   \`\`\`

2. **Install Dependencies**

   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. **Train the Model**

   \`\`\`bash
   python svm.py
   \`\`\`

   This will train the SVM model and save it as \`svm_model.pkl\`.

4. **Run the Application**

   \`\`\`bash
   streamlit run app.py
   \`\`\`

## 📝 Usage

1. Upload your gene test report or input values manually.
2. The system extracts gene markers and preprocesses them.
3. The model predicts your risk score.
4. If risk is high, the app suggests nearby doctors for consultation.

## 📊 Models Used

- Support Vector Machine (SVM)
- Data scaling and normalization with Scikit-learn

## 🔒 Disclaimer

This project is for educational purposes only and is not intended for medical diagnosis. Please consult a qualified healthcare professional for medical advice.

## 🙌 Contributing

Feel free to fork this repo, raise issues, or submit pull requests.

## 📧 Contact

- **Author:** Kartik Patil
- **Email:** pkartik1204@gmail.com
- **GitHub:** [KartikJPatil](https://github.com/KartikJPatil)

---

**⭐ If you like this project, please star the repo!**