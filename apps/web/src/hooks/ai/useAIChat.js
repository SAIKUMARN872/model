"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAIChat = useAIChat;
var react_1 = require("react");
function useAIChat() {
    var _a = (0, react_1.useState)(""), response = _a[0], setResponse = _a[1];
    var askAI = function (question) {
        setResponse("AI response for: ".concat(question));
    };
    return {
        response: response,
        askAI: askAI
    };
}
