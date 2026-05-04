import pandas as pd
import numpy as np

def analyze_solar(df: pd.DataFrame) -> dict:
    # Sort by Voltage
    df = df.sort_values('Voltage').reset_index(drop=True)
    
    V = df['Voltage'].values
    I = df['Current'].values
    
    # Check if the curve is in the fourth quadrant (active solar cell)
    # If standard IV has positive current, we might need to take absolute or negative
    # Typically I is negative when generating power. Let's find absolute power.
    P = V * I
    
    # Voc (V at I=0)
    # Find zero crossing of I
    if len(I) > 1:
        # Interpolate to find exact Voc
        Voc = np.interp(0, I, V) if I[0] < I[-1] else np.interp(0, I[::-1], V[::-1])
    else:
        Voc = None
        
    # Isc (I at V=0)
    # Find zero crossing of V
    if len(V) > 1:
        Isc = np.interp(0, V, I) if V[0] < V[-1] else np.interp(0, V[::-1], I[::-1])
    else:
        Isc = None
        
    # Max power point
    # Power is negative if I is negative, so min(P) or max(|P|)
    max_P_idx = np.argmax(np.abs(P))
    Pmax = np.abs(P[max_P_idx])
    Vmp = V[max_P_idx]
    Imp = np.abs(I[max_P_idx])
    
    # Fill Factor (FF) = Pmax / (Voc * Isc)
    FF = None
    if Voc is not None and Isc is not None:
        Voc_abs = np.abs(Voc)
        Isc_abs = np.abs(Isc)
        if Voc_abs * Isc_abs != 0:
            FF = float(Pmax / (Voc_abs * Isc_abs))
            
    # Efficiency (Assuming standard 1000 W/m^2 illumination and 1cm^2 area if not provided)
    # Let's provide an estimation or generic Pin
    # Pin = 100 mW/cm^2 * Area. If Area = 1, Pin = 100.
    # We will output FF and max Power instead, or nominal efficiency assuming Pin = 100
    nominal_efficiency = float(Pmax / 100 * 100) if Pmax else None # %
    
    parameters = {
        "Voc (V)": round(float(np.abs(Voc)), 4) if Voc is not None else "N/A",
        "Isc (A)": round(float(np.abs(Isc)), 4) if Isc is not None else "N/A",
        "Fill Factor": round(FF, 4) if FF is not None else "N/A",
        "Pmax (W)": round(float(Pmax), 4) if Pmax is not None else "N/A"
    }
    
    return parameters, df
