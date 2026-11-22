from __future__ import annotations

import os
import pickle
import warnings
from pathlib import Path
from typing import Any, Dict, Tuple

from flask import Flask, jsonify, request
from pandas import DataFrame
from sklearn.exceptions import InconsistentVersionWarning

# The model was pickled with scikit-learn 1.6.1. Newer 1.x releases load it
# safely; suppress only that version-mismatch notice to keep API logs clean.
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

# ---------------------------------------------------------------------------
# Paths / configuration
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "model" / "housing_model.pkl"

# Exact order expected by the pickled RandomForestRegressor. Never reorder.
EXPECTED_FEATURES: Tuple[str, ...] = (
    "area",
    "bedrooms",
    "bathrooms",
    "stories",
    "mainroad",
    "guestroom",
    "basement",
    "hotwaterheating",
    "airconditioning",
    "parking",
    "prefarea",
    "furnishingstatus_semi-furnished",
    "furnishingstatus_unfurnished",
)

YES_NO = ("Yes", "No")
FURNISHING_OPTIONS = ("Furnished", "Semi-Furnished", "Unfurnished")

FEATURE_CONFIG: Dict[str, Dict[str, Any]] = {
    "area": {
        "label": "Area",
        "unit": "sq ft",
        "min": 500,
        "max": 50000,
        "step": 10,
        "hint": "Total covered area of the house (typical: 1,000–20,000 sq ft).",
    },
    "bedrooms": {
        "label": "Bedrooms",
        "unit": "rooms",
        "min": 1,
        "max": 10,
        "step": 1,
        "hint": "Number of bedrooms.",
    },
    "bathrooms": {
        "label": "Bathrooms",
        "unit": "rooms",
        "min": 1,
        "max": 10,
        "step": 1,
        "hint": "Number of bathrooms.",
    },
    "stories": {
        "label": "Stories",
        "unit": "floors",
        "min": 1,
        "max": 5,
        "step": 1,
        "hint": "Number of floors in the house.",
    },
    "parking": {
        "label": "Parking",
        "unit": "spaces",
        "min": 0,
        "max": 5,
        "step": 1,
        "hint": "Number of parking spaces available.",
    },
}


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
def load_model() -> Tuple[Any, str | None]:
    if not MODEL_PATH.exists():
        return None, f"Model file not found at {MODEL_PATH}"
    try:
        with MODEL_PATH.open("rb") as file:
            model = pickle.load(file)
        names = getattr(model, "feature_names_in_", None)
        if names is not None and tuple(names) != EXPECTED_FEATURES:
            return None, (
                "Model feature order does not match the expected order. "
                f"Expected {EXPECTED_FEATURES}, got {tuple(names)}"
            )
        return model, None
    except Exception as exc:  # pragma: no cover - defensive startup guard
        return None, f"Could not load model: {exc}"


MODEL, MODEL_ERROR = load_model()

app = Flask(__name__)

# The Vite dev server proxies /api, so CORS is only needed when the frontend is
# served from a different origin. It stays dependency-free on purpose.
ALLOWED_ORIGIN = os.environ.get("CORS_ALLOW_ORIGIN", "*")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# ---------------------------------------------------------------------------
# Validation / encoding
# ---------------------------------------------------------------------------
def _number(payload: Dict[str, Any], key: str, *, integer: bool = False) -> float | int:
    if key not in payload or payload[key] in (None, ""):
        raise ValueError(f"'{key}' is required.")
    value = payload[key]
    if isinstance(value, bool):
        raise ValueError(f"'{key}' must be a number.")
    try:
        number = int(value) if integer else float(value)
    except (TypeError, ValueError):
        raise ValueError(f"'{key}' must be a valid number.")
    if integer and float(value) != number:
        raise ValueError(f"'{key}' must be a whole number.")
    return number


def _choice(payload: Dict[str, Any], key: str, choices: Tuple[str, ...]) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or value.strip() not in choices:
        raise ValueError(f"'{key}' must be one of: {', '.join(choices)}.")
    return value.strip()


def _binary(payload: Dict[str, Any], key: str) -> int:
    """Accept 'Yes'/'No' from the UI (and booleans/0/1 from API clients)."""
    value = payload.get(key)
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)) and value in (0, 1):
        return int(value)
    if isinstance(value, str):
        text = value.strip().lower()
        if text in ("yes", "true", "1"):
            return 1
        if text in ("no", "false", "0"):
            return 0
    raise ValueError(f"'{key}' must be Yes or No.")


def prepare_features(payload: Dict[str, Any]) -> Tuple[DataFrame, Dict[str, Any]]:
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a JSON object.")

    cfg = FEATURE_CONFIG
    values = {
        "area": float(_number(payload, "area")),
        "bedrooms": int(_number(payload, "bedrooms", integer=True)),
        "bathrooms": int(_number(payload, "bathrooms", integer=True)),
        "stories": int(_number(payload, "stories", integer=True)),
        "parking": int(_number(payload, "parking", integer=True)),
    }
    for key, value in values.items():
        limits = cfg[key]
        if not limits["min"] <= value <= limits["max"]:
            raise ValueError(
                f"{limits['label']} must be between {limits['min']} and {limits['max']}."
            )

    selected = {
        key: _choice(payload, key, YES_NO)
        for key in (
            "mainroad",
            "guestroom",
            "basement",
            "hotwaterheating",
            "airconditioning",
            "prefarea",
        )
    }
    furnishing = _choice(payload, "furnishingstatus", FURNISHING_OPTIONS)

    binary = {key: _binary(selected, key) for key in selected}
    encoded = {
        "area": values["area"],
        "bedrooms": values["bedrooms"],
        "bathrooms": values["bathrooms"],
        "stories": values["stories"],
        "mainroad": binary["mainroad"],
        "guestroom": binary["guestroom"],
        "basement": binary["basement"],
        "hotwaterheating": binary["hotwaterheating"],
        "airconditioning": binary["airconditioning"],
        "parking": values["parking"],
        "prefarea": binary["prefarea"],
        # Training used drop-first one-hot encoding: Furnished = (0, 0).
        "furnishingstatus_semi-furnished": 1 if furnishing == "Semi-Furnished" else 0,
        "furnishingstatus_unfurnished": 1 if furnishing == "Unfurnished" else 0,
    }
    # A named DataFrame keeps scikit-learn's feature-name check happy and makes
    # the exact training order explicit.
    row = DataFrame([[encoded[name] for name in EXPECTED_FEATURES]], columns=EXPECTED_FEATURES)
    info = {
        "selected": {**values, **selected, "furnishingstatus": furnishing},
        "features": encoded,
    }
    return row, info


def format_price(inr: float) -> str:
    """Show large Indian prices in lakhs/crores, e.g. ₹ 86.99 Lakh."""
    if inr >= 10_000_000:
        return f"₹ {inr / 10_000_000:,.2f} Cr"
    if inr >= 100_000:
        return f"₹ {inr / 100_000:,.2f} Lakh"
    return f"₹ {inr:,.0f}"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return jsonify(
        {
            "name": "House Price Prediction API",
            "status": "running" if MODEL is not None else "model unavailable",
            "endpoints": ["/api/health", "/api/options", "/api/predict"],
        }
    )


@app.route("/api/health")
def health():
    return jsonify(
        {
            "status": "ok" if MODEL is not None else "error",
            "model_loaded": MODEL is not None,
            "model_path": str(MODEL_PATH),
            "model_type": type(MODEL).__name__ if MODEL is not None else None,
            "n_features": int(MODEL.n_features_in_) if MODEL is not None else None,
            "error": MODEL_ERROR,
        }
    )


@app.route("/api/options")
def options():
    return jsonify(
        {
            "features": FEATURE_CONFIG,
            "yes_no": list(YES_NO),
            "furnishing_options": list(FURNISHING_OPTIONS),
        }
    )


@app.route("/api/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return jsonify({"ok": True})

    if request.content_type and "application/json" not in request.content_type:
        return jsonify(error="Content-Type must be application/json."), 415
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify(error="Invalid or missing JSON body."), 400

    try:
        row, info = prepare_features(payload)
    except ValueError as exc:
        return jsonify(error=str(exc)), 400

    if MODEL is None:
        return jsonify(error=f"Model is unavailable. {MODEL_ERROR}"), 503

    try:
        value = float(MODEL.predict(row)[0])
    except Exception as exc:  # pragma: no cover - defensive runtime guard
        return jsonify(error=f"Prediction failed: {exc}"), 500

    value = round(max(value, 0.0), 2)
    return jsonify(
        {
            "predicted_price": value,
            "predicted_price_inr": round(value),
            "price_lakhs": round(value / 100_000, 2),
            "price_crores": round(value / 10_000_000, 3),
            "formatted_price": format_price(value),
            **info,
        }
    )


@app.errorhandler(404)
def not_found(_error):
    return jsonify(error="Endpoint not found."), 404


@app.errorhandler(405)
def method_not_allowed(_error):
    return jsonify(error="Method not allowed."), 405


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    if MODEL is None:
        app.logger.warning("Model not loaded: %s", MODEL_ERROR)
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
