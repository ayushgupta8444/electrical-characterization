import pandas as pd
import numpy as np

def analyze_mosfet(df_idvg: pd.DataFrame, df_idvd: pd.DataFrame):
    
    # -----------------------------
    # 1. FILTER DATA PROPERLY
    # -----------------------------
    
    # For Id vs Vgs
    df_vgs = df_idvg.sort_values('Vgs').reset_index(drop=True)
    
    # For Id vs Vds
    df_vds = df_idvd.sort_values('Vds').reset_index(drop=True)
    
    # Extract arrays
    Vgs = df_vgs['Vgs'].values
    Id_vgs = df_vgs['Id'].values
    
    Vds = df_vds['Vds'].values
    Id_vds = df_vds['Id'].values
    
    # -----------------------------
    # 2. COMPUTE DERIVATIVES
    # -----------------------------
    
    dVgs = np.gradient(Vgs)
    dId_vgs = np.gradient(Id_vgs)
    
    gm = np.zeros_like(Id_vgs)
    mask_vgs = dVgs != 0
    gm[mask_vgs] = dId_vgs[mask_vgs] / dVgs[mask_vgs]
    
    # -----------------------------
    # 3. SQRT(Id) for Vth
    # -----------------------------
    
    sqrt_Id = np.sqrt(np.abs(Id_vgs))
    dsqrt_Id = np.gradient(sqrt_Id)
    
    gm_sqrt = np.zeros_like(Id_vgs)
    gm_sqrt[mask_vgs] = dsqrt_Id[mask_vgs] / dVgs[mask_vgs]
    
    # -----------------------------
    # 4. THRESHOLD VOLTAGE (Vth)
    # -----------------------------
    
    if len(gm_sqrt) > 0:
        max_idx = np.argmax(gm_sqrt)
        slope = gm_sqrt[max_idx]
        
        if slope != 0:
            Vth = float(Vgs[max_idx] - sqrt_Id[max_idx] / slope)
        else:
            Vth = None
    else:
        Vth = None
    
    # -----------------------------
    # 5. Ion / Ioff
    # -----------------------------
    
    if len(Id_vgs) > 0:
        Ion = float(np.max(Id_vgs))
        
        non_zero = Id_vgs[Id_vgs > 0]
        Ioff = float(np.min(non_zero)) if len(non_zero) > 0 else 1e-15
        
        Ion_Ioff = Ion / Ioff
    else:
        Ion_Ioff = None
    
    # -----------------------------
    # 6. RON (CORRECT METHOD)
    # -----------------------------
    
    linear_region = df_vds[df_vds['Vds'] <= 0.5]
    
    if len(linear_region) > 1:
        dId = np.gradient(linear_region['Id'].values)
        dVds = np.gradient(linear_region['Vds'].values)
        
        slope = np.mean(dId / dVds)
        Ron = float(1 / slope) if slope != 0 else None
    else:
        Ron = None
    
    # -----------------------------
    # 7. PREPARE OUTPUT DATA
    # -----------------------------
    
    df_vgs['sqrt_Id'] = sqrt_Id
    df_vgs['gm'] = gm
    
    # -----------------------------
    # 8. FINAL PARAMETERS
    # -----------------------------
    
    parameters = {
        "Vth (V)": round(Vth, 4) if Vth else "N/A",
        "Ion/Ioff": f"{Ion_Ioff:.2e}" if Ion_Ioff else "N/A",
        "Ron (Ohms)": round(Ron, 4) if Ron else "N/A"
    }
    
    # Return:
    # df_vgs → for Id vs Vgs + sqrt(Id)
    # df_vds → for Id vs Vds
    return parameters, df_vgs, df_vds