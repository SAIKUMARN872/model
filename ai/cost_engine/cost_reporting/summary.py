from typing import Iterable, Dict, Any

def summarize_costs(records: Iterable[Dict[str, Any]]) -> dict:
    rows = list(records)
    total = sum(float(row.get("cost", 0.0)) for row in rows)
    return {
        "total_cost": total,
        "average_cost": total / len(rows) if rows else 0.0,
        "count": len(rows),
    }
