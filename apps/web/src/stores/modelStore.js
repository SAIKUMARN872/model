"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModelStore = void 0;
var zustand_1 = require("zustand");
exports.useModelStore = (0, zustand_1.create)(function (set) { return ({
    selectedModel: "GPT",
    availableModels: [
        "GPT",
        "Claude",
        "Llama"
    ],
    setModel: function (model) {
        return set({
            selectedModel: model
        });
    }
}); });
