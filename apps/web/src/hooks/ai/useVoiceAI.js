"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVoiceAI = useVoiceAI;
var react_1 = require("react");
function useVoiceAI() {
    var _a = (0, react_1.useState)(false), speaking = _a[0], setSpeaking = _a[1];
    var startVoice = function () {
        setSpeaking(true);
    };
    var stopVoice = function () {
        setSpeaking(false);
    };
    return {
        speaking: speaking,
        startVoice: startVoice,
        stopVoice: stopVoice
    };
}
