"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChat = useChat;
var react_1 = require("react");
function useChat() {
    var _a = (0, react_1.useState)([]), messages = _a[0], setMessages = _a[1];
    var sendMessage = function (message) {
        setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [
            {
                role: "user",
                content: message
            }
        ], false); });
    };
    return {
        messages: messages,
        sendMessage: sendMessage
    };
}
