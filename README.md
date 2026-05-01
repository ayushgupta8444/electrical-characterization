# MOSFET Parameter Extraction Tool

Full-stack web application for extracting key MOSFET parameters from measured/simulated `Vgs`, `Vds`, and `Id` data.

## Stack

- Frontend: React (Vite) + Tailwind CSS + Chart.js
- Backend: Python Flask API

## Features

- Manual input and CSV upload (`Vgs`, `Vds`, `Id`)
- Graphs:
  - Transfer: `Id vs Vgs`
  - Output: `Id vs Vds`
  - Threshold extraction: `sqrt(Id) vs Vgs` with highlighted `Vth`
- Backend parameter extraction:
  - Threshold voltage (`Vth`) from linear fit on `sqrt(Id)-Vgs`
  - `gm = dId / dVgs`
  - `gds = dId / dVds`
  - Mobility (`mu`)
  - On resistance (`Ron = 1/gds`)
  - On/Off ratio (`Ion/Ioff`)
  - Early voltage (`VA = Id/gds`)
  - Subthreshold slope (`S = dVgs / d(log10 Id)`)
  - Cutoff frequency (`fT = gm / (2*pi*(Cgs + Cgd))`)
- Download results as JSON or PDF
- Auto-detects a linear region for `Vth` fitting
- Basic moving-average smoothing for graph readability

## Project Structure

- `backend/` Flask API and extraction logic
- `frontend/` React UI and chart rendering

## Run Locally

### 1) Backend (Flask)

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

API starts at `http://127.0.0.1:5000`.

### 2) Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at the Vite URL (typically `http://127.0.0.1:5173`).

## API

### `POST /analyze`

Accepts JSON body:

```json
{
  "data": [
    { "Vgs": 0, "Vds": 0.1, "Id": 1e-7 },
    { "Vgs": 1, "Vds": 0.1, "Id": 1e-6 }
  ],
  "constants": {
    "cox": 0.01,
    "width": 0.0001,
    "length": 0.000001,
    "cgs": 1e-12,
    "cgd": 0.5e-12
  }
}
```

Or send CSV directly with `Content-Type: text/csv`.

Response returns:

- Extracted parameters
- Threshold fit metadata
- Processed graph data (`sqrtId`, `gm`, `gds`)

