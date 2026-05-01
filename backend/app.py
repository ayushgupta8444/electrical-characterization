import csv
import io
from typing import List

from flask import Flask, jsonify, request
from flask_cors import CORS

from calculations import compute_parameters


app = Flask(__name__)
CORS(app)


def _validate_rows(rows: List[dict]) -> List[dict]:
    cleaned = []
    for idx, row in enumerate(rows):
        try:
            cleaned.append(
                {
                    "Vgs": float(row["Vgs"]),
                    "Vds": float(row["Vds"]),
                    "Id": float(row["Id"]),
                }
            )
        except (KeyError, TypeError, ValueError) as exc:
            raise ValueError(f"Invalid row at index {idx}: {exc}") from exc
    return cleaned


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/analyze")
def analyze():
    try:
        data_rows = []
        constants = {}

        if request.content_type and "text/csv" in request.content_type:
            content = request.data.decode("utf-8")
            reader = csv.DictReader(io.StringIO(content))
            data_rows = [row for row in reader]
        else:
            payload = request.get_json(silent=True) or {}
            data_rows = payload.get("data", [])
            constants = payload.get("constants", {})

        if not data_rows:
            return jsonify({"error": "No input data provided."}), 400

        cleaned_data = _validate_rows(data_rows)
        result = compute_parameters(cleaned_data, constants=constants)
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Unexpected server error: {exc}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
