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
exports.useChatStore = void 0;
var zustand_1 = require("zustand");
exports.useChatStore = (0, zustand_1.create)(function (set) { return ({
    messages: [],
    addMessage: function (message) {
        return set(function (state) { return ({
            messages: __spreadArray(__spreadArray([], state.messages, true), [
                message
            ], false)
        }); });
    },
    clearMessages: function () {
        return set({
            messages: []
        });
    }
}); });
