from typing import Iterable, Dict, Any

def build_cost_report(records: Iterable[Dict[str, Any]]) -> dict:
    rows = list(records)
    total = sum(float(row.get("cost", 0.0)) for row in rows)
    return {"total_cost": total, "records": rows}
