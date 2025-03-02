import pandas as pd
import pickle
from sklearn.model_selection import train_test_split, GridSearchCV
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

# Define parameter grid for GridSearchCV
param_grid = {'n_neighbors': range(1, 31)}  # Testing k values from 1 to 30

# Apply GridSearchCV
grid_search = GridSearchCV(KNeighborsClassifier(), param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, Y_train)

# Best parameter selection
best_k = grid_search.best_params_['n_neighbors']
print(f"Best n_neighbors: {best_k}")

# Train model with the best parameter
knn = KNeighborsClassifier(n_neighbors=best_k)
knn.fit(X_train, Y_train)

# Evaluate model
y_pred = knn.predict(X_test)
print("Accuracy:", accuracy_score(Y_test, y_pred))
print("Precision:", precision_score(Y_test, y_pred, average='weighted'))
print("Recall:", recall_score(Y_test, y_pred, average='weighted'))
print("F1 Score:", f1_score(Y_test, y_pred, average='weighted'))

from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Standardize the features and apply GridSearchCV
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsClassifier())
])

param_grid = {
    'knn__n_neighbors': range(1, 50),  # Search a wider range of neighbors
    'knn__weights': ['uniform', 'distance'],  # Distance-based weighting
    'knn__metric': ['euclidean', 'manhattan', 'minkowski']  # Test different distance metrics
}

grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, Y_train)

best_knn = grid_search.best_estimator_
print("Best KNN Score:", grid_search.best_score_)


# Save optimized model
pickle.dump(knn, open('model1.pkl', 'wb'))
