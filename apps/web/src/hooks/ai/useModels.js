"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAIModels = useAIModels;
var react_1 = require("react");
function useAIModels() {
    var _a = (0, react_1.useState)([
        "GPT",
        "Claude",
        "Llama"
    ]), models = _a[0], setModels = _a[1];
    return {
        models: models,
        setModels: setModels
    };
}
