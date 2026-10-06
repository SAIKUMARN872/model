from typing import Iterable, Dict, Any

def build_cost_chart_data(records: Iterable[Dict[str, Any]]) -> list[dict]:
    return [
        {
            "label": record.get("label", record.get("model", "unknown")),
            "cost": float(record.get("cost", 0.0)),
        }
        for record in records
    ]
