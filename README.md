# HousePrice AI

React UI + Flask API for the saved `model/housing_model.pkl` (scikit-learn RandomForestRegressor).

## Run locally

**1. Backend** (terminal 1):

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Flask listens on `http://127.0.0.1:5000`.

**2. Frontend** (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5174`. Vite proxies `/api` to Flask.

## API

- `GET /api/health` — model load status
- `GET /api/options` — allowed field values and input ranges
- `POST /api/predict` — JSON body example:

```json
{
  "area": 7420,
  "bedrooms": 4,
  "bathrooms": 2,
  "stories": 3,
  "mainroad": "Yes",
  "guestroom": "No",
  "basement": "No",
  "hotwaterheating": "No",
  "airconditioning": "Yes",
  "parking": 2,
  "prefarea": "Yes",
  "furnishingstatus": "Furnished"
}
```

Yes/No fields are encoded as 1/0 and `furnishingstatus` as drop-first one-hot
(`Furnished` = 0/0, `Semi-Furnished` = 1/0, `Unfurnished` = 0/1), matching the
13 feature names stored in the pickle. The response contains the price in INR
plus a formatted lakh/crore string.

## Production build

```bash
cd frontend && npm run build
```

Serve `frontend/dist` with any static server while keeping the Flask API reachable
at `/api`.
