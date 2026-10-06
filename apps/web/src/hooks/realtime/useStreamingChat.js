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
exports.useStreamingChat = useStreamingChat;
var react_1 = require("react");
function useStreamingChat() {
    var _a = (0, react_1.useState)([]), stream = _a[0], setStream = _a[1];
    var addChunk = function (chunk) {
        setStream(function (prev) { return __spreadArray(__spreadArray([], prev, true), [
            chunk
        ], false); });
    };
    return {
        stream: stream,
        addChunk: addChunk
    };
}
