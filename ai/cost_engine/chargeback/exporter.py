from typing import Any, Dict, Iterable

def export_chargeback(records: Iterable[Any]) -> list[Dict[str, Any]]:
    result = []
    for record in records:
        if hasattr(record, "__dict__"):
            result.append(dict(record.__dict__))
        elif isinstance(record, dict):
            result.append(dict(record))
        else:
            result.append({"value": record})
    return result
