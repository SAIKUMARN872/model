"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRealtime = useRealtime;
var react_1 = require("react");
function useRealtime() {
    var _a = (0, react_1.useState)(false), connected = _a[0], setConnected = _a[1];
    var connect = function () {
        setConnected(true);
    };
    var disconnect = function () {
        setConnected(false);
    };
    return {
        connected: connected,
        connect: connect,
        disconnect: disconnect
    };
}
