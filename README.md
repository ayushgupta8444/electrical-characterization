# Universal Semiconductor Device Analyzer

A production-ready full-stack web application designed for high-performance scientific analysis and visualization of semiconductor device data (MOSFET, MOSCAP, Solar Cell).

## Features

- **Multi-Device Support:** Analyzes MOSFET, MOSCAP, and Solar Cells.
- **Large Dataset Handling:** Efficiently processes and downsamples 50,000+ row CSVs using Pandas.
- **Interactive WebGL Plots:** Utilizes `Plotly.js` (`scattergl`) for optimized rendering of thousands of data points.
- **Modern UI:** Built with React, Tailwind CSS (Glassmorphism aesthetics).
- **FastAPI Backend:** Fully asynchronous, efficient, and typed using Python.

## Quick Start

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (already created if you used the provided script):
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn python-multipart pandas numpy pydantic
   ```
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Setup

1. Open another terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL in your browser (usually `http://localhost:5173`).

### 3. Sample Data
You can find sample CSV files for testing in the `sample_data` directory.
