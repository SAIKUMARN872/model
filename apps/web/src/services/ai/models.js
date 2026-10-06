"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelService = void 0;
exports.modelService = {
    getModels: function () {
        return [
            "GPT",
            "Claude",
            "Llama"
        ];
    },
    selectModel: function (model) {
        return {
            selected: model
        };
    }
};
