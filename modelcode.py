import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from google.colab import files

# 1. Prepare Features and Target
# Convert remaining categorical 'furnishingstatus' using one-hot encoding
df_encoded = pd.get_dummies(df, columns=['furnishingstatus'], drop_first=True)

X = df_encoded.drop('price', axis=1)
y = df_encoded['price']

# 2. Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Train Model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 4. Evaluate
y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)
print(f'Root Mean Squared Error: {rmse:,.2f}')
print(f'R^2 Score: {r2:.4f}')