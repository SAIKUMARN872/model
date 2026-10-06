"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVoiceSession = useVoiceSession;
var react_1 = require("react");
function useVoiceSession() {
    var _a = (0, react_1.useState)(false), active = _a[0], setActive = _a[1];
    var startSession = function () {
        setActive(true);
    };
    var endSession = function () {
        setActive(false);
    };
    return {
        active: active,
        startSession: startSession,
        endSession: endSession
    };
}
