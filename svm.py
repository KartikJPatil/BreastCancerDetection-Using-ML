import pandas as pd
from sklearn.model_selection import train_test_split

# Load dataset
df = pd.read_csv('upscale.csv')

# Drop unwanted column
if "Hybridization REF" in df.columns:
    df = df.drop(columns="Hybridization REF")

# Split into training (90%) and external test (10%)
df_train, df_external_test = train_test_split(df, test_size=0.1, random_state=42, stratify=df.iloc[:, 21])

# Save external test set
df_external_test.to_csv('external_test.csv', index=False)

print("✅ External test set saved as 'external_test.csv'. Now run the validation code on it!")
import pandas as pd
import pickle
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Load the external validation dataset
df_val = pd.read_csv('external_test.csv')  # Update with the actual filename

# Drop unwanted column if it exists
if "Hybridization REF" in df_val.columns:
    df_val = df_val.drop(columns="Hybridization REF")

# Separate features and labels
X_val = df_val.iloc[:, 0:21].values  # Adjust if your dataset has a different structure
y_val = df_val.iloc[:, 21].values

# Load the trained model & scaler
svm_model = pickle.load(open('svm_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

# Standardize the validation dataset
X_val_scaled = scaler.transform(X_val)

# Predict using the loaded model
y_pred_val = svm_model.predict(X_val_scaled)

# Evaluate performance
print("\n🔹 External Validation Results 🔹")
print(f"Accuracy: {accuracy_score(y_val, y_pred_val):.4f}")
print(f"Precision: {precision_score(y_val, y_pred_val, average='weighted'):.4f}")
print(f"Recall: {recall_score(y_val, y_pred_val, average='weighted'):.4f}")
print(f"F1 Score: {f1_score(y_val, y_pred_val, average='weighted'):.4f}")

# Confusion Matrix
print("\nConfusion Matrix:")
print(confusion_matrix(y_val, y_pred_val))

