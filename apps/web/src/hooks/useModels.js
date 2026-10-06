"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModels = useModels;
var react_1 = require("react");
function useModels() {
    var _a = (0, react_1.useState)("GPT"), model = _a[0], setModel = _a[1];
    return {
        model: model,
        setModel: setModel
    };
}
