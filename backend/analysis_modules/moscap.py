import pandas as pd
import numpy as np

def analyze_moscap(df: pd.DataFrame) -> dict:
    # Sort by Vg
    df = df.sort_values('Vg').reset_index(drop=True)
    
    Vg = df['Vg'].values
    C = df['C'].values
    
    # Extract flat-band voltage (Vfb)
    # Vfb is typically near the inflection point of C-V curve
    # Find max derivative of C with respect to Vg
    dVg = np.gradient(Vg)
    dC = np.gradient(C)
    
    dC_dVg = np.zeros_like(C)
    mask = dVg != 0
    dC_dVg[mask] = dC[mask] / dVg[mask]
    
    if np.any(mask):
        max_slope_idx = np.argmax(np.abs(dC_dVg))
        Vfb = float(Vg[max_slope_idx])
    else:
        Vfb = None
        
    # Estimate threshold voltage (Vth)
    # Vth is typically where capacitance reaches minimum and starts to invert,
    # or strongly inverted. For simplicity, we can define Vth as the voltage
    # where C is min.
    if len(C) > 0:
        min_C_idx = np.argmin(C)
        Vth = float(Vg[min_C_idx])
        
        # Another approach: find the point where it stabilizes
    else:
        Vth = None
        
    parameters = {
        "Vfb (V)": round(Vfb, 4) if Vfb is not None else "N/A",
        "Estimated Vth (V)": round(Vth, 4) if Vth is not None else "N/A"
    }
    
    return parameters, df
