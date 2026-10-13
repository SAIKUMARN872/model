"""JSON-RPC 2.0 message constructors."""

def request(method, params=None, request_id=1):
    if not isinstance(method, str) or not method.strip():
        raise ValueError("method must be non-empty.")
    message = {"jsonrpc": "2.0", "id": request_id, "method": method}
    if params is not None:
        message["params"] = params
    return message


def notification(method, params=None):
    if not isinstance(method, str) or not method.strip():
        raise ValueError("method must be non-empty.")
    message = {"jsonrpc": "2.0", "method": method}
    if params is not None:
        message["params"] = params
    return message


def success_response(request_id, result):
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def error_response(request_id, code, message, data=None):
    error = {"code": int(code), "message": str(message)}
    if data is not None:
        error["data"] = data
    return {"jsonrpc": "2.0", "id": request_id, "error": error}
