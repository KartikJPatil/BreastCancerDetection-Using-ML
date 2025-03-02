import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Load dataset
df = pd.read_csv('upscale.csv')

# Drop unwanted column
df = df.drop(columns="Hybridization REF")

# Train-test split
X = df.iloc[:, 0:21].values
y = df.iloc[:, 21].values
X_train, X_test, Y_train, Y_test = train_test_split(X, y, test_size=0.2, random_state=1)

# Train model with latest scikit-learn version
knn = KNeighborsClassifier(n_neighbors=15)
knn.fit(X_train, Y_train)

# Evaluate
y_pred = knn.predict(X_test)
print("Accuracy:", accuracy_score(Y_test, y_pred))
print("Precision:", precision_score(Y_test, y_pred))
print("Recall:", recall_score(Y_test, y_pred))
print("F1 Score:", f1_score(Y_test, y_pred))

# Save model
pickle.dump(knn, open('model1.pkl', 'wb'))
