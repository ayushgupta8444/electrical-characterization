import math
from dataclasses import dataclass
from typing import Dict, List, Optional


EPSILON = 1e-12


@dataclass
class DeviceConstants:
    cox: float = 1e-2
    width: float = 100e-6
    length: float = 1e-6
    cgs: float = 1e-12
    cgd: float = 0.5e-12


def _sort_by(x: List[float], y: List[float]) -> tuple[list[float], list[float]]:
    sorted_pairs = sorted(zip(x, y), key=lambda p: p[0])
    return [p[0] for p in sorted_pairs], [p[1] for p in sorted_pairs]


def numerical_derivative(x: List[float], y: List[float]) -> List[float]:
    if len(x) != len(y):
        raise ValueError("x and y must have the same length.")
    if len(x) < 2:
        return [0.0 for _ in x]

    deriv = []
    n = len(x)
    for i in range(n):
        if i == 0:
            dx = x[i + 1] - x[i]
            dy = y[i + 1] - y[i]
        elif i == n - 1:
            dx = x[i] - x[i - 1]
            dy = y[i] - y[i - 1]
        else:
            dx = x[i + 1] - x[i - 1]
            dy = y[i + 1] - y[i - 1]
        deriv.append(dy / dx if abs(dx) > EPSILON else 0.0)
    return deriv


def linear_regression(x: List[float], y: List[float]) -> tuple[float, float]:
    n = len(x)
    if n < 2:
        raise ValueError("At least two points are required for linear regression.")

    sum_x = sum(x)
    sum_y = sum(y)
    sum_xx = sum(v * v for v in x)
    sum_xy = sum(vx * vy for vx, vy in zip(x, y))
    denom = n * sum_xx - sum_x * sum_x
    if abs(denom) < EPSILON:
        raise ValueError("Cannot fit line: denominator is near zero.")

    slope = (n * sum_xy - sum_x * sum_y) / denom
    intercept = (sum_y - slope * sum_x) / n
    return slope, intercept


def auto_detect_linear_region(vgs: List[float], sqrt_id: List[float]) -> tuple[int, int]:
    n = len(vgs)
    if n < 6:
        return 0, n

    best_start = 0
    best_end = n
    best_score = float("-inf")
    window = max(6, n // 3)

    for start in range(0, n - window + 1):
        end = start + window
        x = vgs[start:end]
        y = sqrt_id[start:end]
        try:
            slope, intercept = linear_regression(x, y)
        except ValueError:
            continue
        if slope <= 0:
            continue

        y_hat = [slope * xi + intercept for xi in x]
        y_mean = sum(y) / len(y)
        ss_tot = sum((yi - y_mean) ** 2 for yi in y) + EPSILON
        ss_res = sum((yi - yhi) ** 2 for yi, yhi in zip(y, y_hat))
        r2 = 1 - (ss_res / ss_tot)
        score = r2 * slope
        if score > best_score:
            best_score = score
            best_start = start
            best_end = end

    return best_start, best_end


def extract_threshold_voltage(vgs: List[float], id_values: List[float]) -> Dict[str, float]:
    sqrt_id = [math.sqrt(max(v, 0.0)) for v in id_values]
    vgs_s, sqrt_id_s = _sort_by(vgs, sqrt_id)
    start, end = auto_detect_linear_region(vgs_s, sqrt_id_s)
    x = vgs_s[start:end]
    y = sqrt_id_s[start:end]
    slope, intercept = linear_regression(x, y)
    vth = -intercept / slope
    return {
        "vth": vth,
        "slope": slope,
        "intercept": intercept,
        "fit_start": x[0],
        "fit_end": x[-1],
    }


def compute_parameters(data: List[Dict[str, float]], constants: Optional[Dict[str, float]] = None) -> Dict:
    if len(data) < 3:
        raise ValueError("At least three valid data points are required.")

    const = DeviceConstants(**(constants or {}))

    vgs = [float(row["Vgs"]) for row in data]
    vds = [float(row["Vds"]) for row in data]
    ids = [max(float(row["Id"]), EPSILON) for row in data]

    vth_result = extract_threshold_voltage(vgs, ids)
    gm = numerical_derivative(vgs, ids)
    gds = numerical_derivative(vds, ids)

    gm_avg = sum(gm) / max(len(gm), 1)
    gds_avg = sum(gds) / max(len(gds), 1)
    id_avg = sum(ids) / len(ids)
    ion = max(ids)
    ioff = min(ids)

    # mu = gm * L / (Cox * W * Vds)
    vds_nonzero = [abs(v) for v in vds if abs(v) > EPSILON]
    vds_ref = sum(vds_nonzero) / max(len(vds_nonzero), 1)
    mobility = (gm_avg * const.length) / max(const.cox * const.width * vds_ref, EPSILON)
    ron = 1.0 / max(abs(gds_avg), EPSILON)
    on_off = ion / max(ioff, EPSILON)
    early_voltage = id_avg / max(abs(gds_avg), EPSILON)

    # Subthreshold slope S = dVgs / d(log10(Id)).
    log_id = [math.log10(v) for v in ids]
    dlog_dvgs = numerical_derivative(vgs, log_id)
    valid = [v for v in dlog_dvgs if abs(v) > EPSILON]
    subthreshold_slope = (
        1.0 / (sum(valid) / len(valid)) if valid else float("inf")
    )

    ft = gm_avg / (2 * math.pi * (const.cgs + const.cgd))

    sqrt_id = [math.sqrt(max(v, 0.0)) for v in ids]
    processed_data = [
        {
            "Vgs": vgs[i],
            "Vds": vds[i],
            "Id": ids[i],
            "sqrtId": sqrt_id[i],
            "gm": gm[i],
            "gds": gds[i],
        }
        for i in range(len(data))
    ]

    return {
        "parameters": {
            "thresholdVoltageVth": vth_result["vth"],
            "transconductanceGm": gm_avg,
            "outputConductanceGds": gds_avg,
            "mobilityMu": mobility,
            "onResistanceRon": ron,
            "onOffRatioIonIoff": on_off,
            "earlyVoltageVA": early_voltage,
            "subthresholdSlopeS": subthreshold_slope,
            "cutoffFrequencyFt": ft,
        },
        "thresholdMeta": vth_result,
        "constantsUsed": {
            "cox": const.cox,
            "width": const.width,
            "length": const.length,
            "cgs": const.cgs,
            "cgd": const.cgd,
        },
        "processedData": processed_data,
    }
