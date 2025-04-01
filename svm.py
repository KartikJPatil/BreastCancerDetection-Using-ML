import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

# Load dataset (Replace 'data.csv' with your actual dataset)
df = pd.read_csv('external_test.csv')  # Ensure this file is present in your project directory

# Separate features and target
X = df.iloc[:, :-1].values  # All columns except the last (features)
y = df.iloc[:, -1].values   # Last column (target: 0 = No Risk, 1 = Risk)

# Split into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Feature scaling (Standardization)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train SVM model with probability enabled for risk score calculation
svm_model = SVC(kernel='linear', probability=True, random_state=42)
svm_model.fit(X_train_scaled, y_train)

# Predict on test data and calculate accuracy
y_pred = svm_model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)

# Save trained model and scaler
pickle.dump(svm_model, open('svm_model.pkl', 'wb'))
pickle.dump(scaler, open('scaler.pkl', 'wb'))

# Print results
print(f"✅ Model training complete. Accuracy: {accuracy * 100:.2f}%")
print("✅ SVM model and scaler saved successfully.")
