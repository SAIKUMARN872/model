"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryService = void 0;
exports.memoryService = {
    saveMemory: function (data) {
        localStorage.setItem("memory", JSON.stringify(data));
    },
    getMemory: function () {
        var data = localStorage.getItem("memory");
        return data ?
            JSON.parse(data) :
            [];
    }
};
