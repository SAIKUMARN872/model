from typing import Iterable, Dict, Any

def build_savings_report(records: Iterable[Dict[str, Any]]) -> dict:
    rows = list(records)
    baseline = sum(float(row.get("baseline_cost", 0.0)) for row in rows)
    optimized = sum(float(row.get("optimized_cost", 0.0)) for row in rows)
    savings = max(0.0, baseline - optimized)
    return {
        "baseline_cost": baseline,
        "optimized_cost": optimized,
        "savings": savings,
        "savings_percent": (savings / baseline * 100) if baseline else 0.0,
    }
