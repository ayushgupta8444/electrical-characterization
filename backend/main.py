from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import traceback

from utils.csv_parser import parse_and_validate_csv, downsample_data
from analysis_modules.mosfet import analyze_mosfet
from analysis_modules.moscap import analyze_moscap
from analysis_modules.solar import analyze_solar

app = FastAPI(title="Universal Semiconductor Device Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_device(
    device_type: str = Form(...),
    file: UploadFile = File(None),
    file_idvd: UploadFile = File(None),
    file_idvg: UploadFile = File(None)
):
    try:
        # 2. Analyze
        if device_type.lower() == "mosfet":
            if not file_idvd or not file_idvg:
                raise HTTPException(status_code=400, detail="MOSFET requires both IDVD and IDVG files.")
                
            contents_idvd = await file_idvd.read()
            contents_idvg = await file_idvg.read()
            
            df_idvd = parse_and_validate_csv(contents_idvd, "mosfet_idvd")
            df_idvg = parse_and_validate_csv(contents_idvg, "mosfet_idvg")
            
            parameters, df_vgs, df_vds = analyze_mosfet(df_idvg, df_idvd)
            df_vgs_downsampled = downsample_data(df_vgs, max_rows=5000).replace({float('nan'): None})
            df_vds_downsampled = downsample_data(df_vds, max_rows=5000).replace({float('nan'): None})
            
            graph_data = {
                "Vgs": df_vgs_downsampled["Vgs"].tolist() if "Vgs" in df_vgs_downsampled else [],
                "Id_vgs": df_vgs_downsampled["Id"].tolist() if "Id" in df_vgs_downsampled else [],
                "sqrt_Id": df_vgs_downsampled["sqrt_Id"].tolist() if "sqrt_Id" in df_vgs_downsampled else [],
                "Vds": df_vds_downsampled["Vds"].tolist() if "Vds" in df_vds_downsampled else [],
                "Id_vds": df_vds_downsampled["Id"].tolist() if "Id" in df_vds_downsampled else []
            }
        elif device_type.lower() == "moscap":
            if not file:
                raise HTTPException(status_code=400, detail="Missing data file.")
            contents = await file.read()
            df = parse_and_validate_csv(contents, device_type)
            parameters, processed_df = analyze_moscap(df)
            downsampled_df = downsample_data(processed_df, max_rows=5000).replace({float('nan'): None})
            graph_data = downsampled_df.to_dict(orient='list')
        elif device_type.lower() in ["solar", "solar cell", "solar_cell"]:
            if not file:
                raise HTTPException(status_code=400, detail="Missing data file.")
            contents = await file.read()
            df = parse_and_validate_csv(contents, device_type)
            parameters, processed_df = analyze_solar(df)
            downsampled_df = downsample_data(processed_df, max_rows=5000).replace({float('nan'): None})
            graph_data = downsampled_df.to_dict(orient='list')
        else:
            raise HTTPException(status_code=400, detail="Unsupported device type.")
            
        return {
            "parameters": parameters,
            "graph_data": graph_data
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred during processing: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
