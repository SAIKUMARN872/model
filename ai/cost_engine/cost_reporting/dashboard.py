from typing import Iterable, Dict, Any

def build_cost_dashboard(records: Iterable[Dict[str, Any]]) -> dict:
    rows = list(records)
    total = sum(float(row.get("cost", 0.0)) for row in rows)
    return {
        "total_cost": total,
        "record_count": len(rows),
        "records": rows,
    }
