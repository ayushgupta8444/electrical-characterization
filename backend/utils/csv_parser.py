import pandas as pd
from fastapi import HTTPException
import io

def parse_and_validate_csv(file_bytes: bytes, device_type: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid CSV format.")
    
    # Strip whitespace from column names just in case
    df.columns = df.columns.str.strip()
    
    device_lower = device_type.lower()
    if device_lower == "mosfet_idvd":
        required_cols = {"Vds", "Id"}
    elif device_lower == "mosfet_idvg":
        required_cols = {"Vgs", "Id"}
    elif device_lower == "moscap":
        required_cols = {"Vg", "C"}
    elif device_lower in ["solar cell", "solar", "solar_cell"]:
        required_cols = {"Voltage", "Current"}
    else:
        raise HTTPException(status_code=400, detail=f"Unknown device type: {device_type}")
        
    missing_cols = required_cols - set(df.columns)
    if missing_cols:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing_cols)}")
        
    if device_lower in ["mosfet_idvd", "mosfet_idvg"]:
        optionals = {"L", "W", "Cox", "Vgs", "Vds"}
        keep_cols = list(required_cols.union(optionals.intersection(set(df.columns))))
        df = df[keep_cols]
    else:
        df = df[list(required_cols)]
        
    # Convert data to float32
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').astype('float32')
        
    df = df.dropna()
    
    if df.empty:
        raise HTTPException(status_code=400, detail="CSV contains no valid numeric data.")
        
    return df

def downsample_data(df: pd.DataFrame, max_rows: int = 5000) -> pd.DataFrame:
    if len(df) > max_rows:
        n = len(df) // max_rows + 1
        return df.iloc[::n].reset_index(drop=True)
    return df
