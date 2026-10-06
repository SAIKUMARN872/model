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
exports.useAgents = useAgents;
var react_1 = require("react");
function useAgents() {
    var _a = (0, react_1.useState)([]), agents = _a[0], setAgents = _a[1];
    var addAgent = function (agent) {
        setAgents(function (prev) { return __spreadArray(__spreadArray([], prev, true), [
            agent
        ], false); });
    };
    return {
        agents: agents,
        addAgent: addAgent
    };
}
