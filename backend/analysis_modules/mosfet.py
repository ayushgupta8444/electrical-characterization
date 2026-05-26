import pandas as pd
import numpy as np

def analyze_mosfet(df_idvg: pd.DataFrame, df_idvd: pd.DataFrame):
    df_vgs = None
    df_vds = None
    Vth = None
    Ion_Ioff = None
    Ron = None

    # -----------------------------
    # 1. ANALYZE Id vs Vgs (if df_idvg is provided)
    # -----------------------------
    if df_idvg is not None and not df_idvg.empty:
        df_vgs = df_idvg.sort_values('Vgs').reset_index(drop=True)
        
        # Extract arrays
        Vgs = df_vgs['Vgs'].values
        Id_vgs = df_vgs['Id'].values
        
        # 2. COMPUTE DERIVATIVES
        dVgs = np.gradient(Vgs)
        dId_vgs = np.gradient(Id_vgs)
        
        gm = np.zeros_like(Id_vgs)
        mask_vgs = dVgs != 0
        gm[mask_vgs] = dId_vgs[mask_vgs] / dVgs[mask_vgs]
        
        # 3. SQRT(Id) for Vth
        sqrt_Id = np.sqrt(np.abs(Id_vgs))
        dsqrt_Id = np.gradient(sqrt_Id)
        
        gm_sqrt = np.zeros_like(Id_vgs)
        gm_sqrt[mask_vgs] = dsqrt_Id[mask_vgs] / dVgs[mask_vgs]
        
        # 4. THRESHOLD VOLTAGE (Vth)
        if len(gm_sqrt) > 0:
            max_idx = np.argmax(gm_sqrt)
            slope = gm_sqrt[max_idx]
            
            if slope != 0 and np.isfinite(slope) and np.isfinite(Vgs[max_idx]) and np.isfinite(sqrt_Id[max_idx]):
                val = float(Vgs[max_idx] - sqrt_Id[max_idx] / slope)
                Vth = val if np.isfinite(val) else None
            else:
                Vth = None
        else:
            Vth = None
        
        # 5. Ion / Ioff
        if len(Id_vgs) > 0:
            Ion = float(np.max(Id_vgs))
            
            non_zero = Id_vgs[Id_vgs > 0]
            Ioff = float(np.min(non_zero)) if len(non_zero) > 0 else 1e-15
            
            if Ioff != 0 and np.isfinite(Ion) and np.isfinite(Ioff):
                val = Ion / Ioff
                Ion_Ioff = val if np.isfinite(val) else None
            else:
                Ion_Ioff = None
        else:
            Ion_Ioff = None
            
        df_vgs['sqrt_Id'] = sqrt_Id
        df_vgs['gm'] = gm

    # -----------------------------
    # 2. ANALYZE Id vs Vds (if df_idvd is provided)
    # -----------------------------
    if df_idvd is not None and not df_idvd.empty:
        df_vds = df_idvd.sort_values('Vds').reset_index(drop=True)
        
        # Extract arrays
        Vds = df_vds['Vds'].values
        Id_vds = df_vds['Id'].values
        
        # 6. RON (CORRECT METHOD)
        linear_region = df_vds[df_vds['Vds'] <= 0.5]
        
        if len(linear_region) > 1:
            dId = np.gradient(linear_region['Id'].values)
            dVds = np.gradient(linear_region['Vds'].values)
            
            valid_mask = dVds != 0
            if np.any(valid_mask):
                slopes = dId[valid_mask] / dVds[valid_mask]
                slopes = slopes[np.isfinite(slopes)]
                if len(slopes) > 0:
                    slope = np.mean(slopes)
                    if slope != 0 and np.isfinite(slope):
                        Ron = float(1 / slope)
                    else:
                        Ron = None
                else:
                    Ron = None
            else:
                Ron = None
        else:
            Ron = None
            
    # -----------------------------
    # 3. FINAL PARAMETERS
    # -----------------------------
    parameters = {}
    if df_idvg is not None and not df_idvg.empty:
        parameters["Vth (V)"] = round(Vth, 4) if (Vth is not None and np.isfinite(Vth)) else "N/A"
        parameters["Ion/Ioff"] = f"{Ion_Ioff:.2e}" if (Ion_Ioff is not None and np.isfinite(Ion_Ioff)) else "N/A"
    if df_idvd is not None and not df_idvd.empty:
        parameters["Ron (Ohms)"] = round(Ron, 4) if (Ron is not None and np.isfinite(Ron)) else "N/A"
        
    return parameters, df_vgs, df_vds