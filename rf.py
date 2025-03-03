import pandas as pd
import pickle
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
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
param_grid = {
    'n_estimators': [50, 100, 200],  # Number of trees in the forest
    'max_depth': [10, 20, 30, None],  # Depth of trees
    'min_samples_split': [2, 5, 10],  # Minimum samples to split
    'min_samples_leaf': [1, 2, 4]  # Minimum samples per leaf
}

# Apply GridSearchCV
grid_search = GridSearchCV(RandomForestClassifier(), param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, Y_train)

# Best parameter selection
best_params = grid_search.best_params_
print(f"Best parameters: {best_params}")

# Train model with best parameters
rf = RandomForestClassifier(
    n_estimators=best_params['n_estimators'],
    max_depth=best_params['max_depth'],
    min_samples_split=best_params['min_samples_split'],
    min_samples_leaf=best_params['min_samples_leaf'],
    random_state=1
)
rf.fit(X_train, Y_train)

# Evaluate model
y_pred = rf.predict(X_test)
print("Accuracy:", accuracy_score(Y_test, y_pred))
print("Precision:", precision_score(Y_test, y_pred, average='weighted'))
print("Recall:", recall_score(Y_test, y_pred, average='weighted'))
print("F1 Score:", f1_score(Y_test, y_pred, average='weighted'))

from sklearn.model_selection import RandomizedSearchCV

param_dist = {
    'n_estimators': [100, 200, 500, 1000],  # Increase number of trees
    'max_depth': [10, 20, 30, None],  # More flexible depths
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'bootstrap': [True, False]  # Try both bootstrap methods
}

random_search = RandomizedSearchCV(RandomForestClassifier(), param_dist,n_iter=50, cv=5, scoring='accuracy', n_jobs=-1, random_state=42)
random_search.fit(X_train, Y_train)

best_rf = random_search.best_estimator_
print("Best RF Score:", random_search.best_score_)


# Save optimized model
pickle.dump(rf, open('random_forest_model.pkl', 'wb'))
