"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentService = void 0;
exports.agentService = {
    getAgents: function () {
        return [
            {
                id: 1,
                name: "Research Agent"
            },
            {
                id: 2,
                name: "Voice Agent"
            }
        ];
    },
    createAgent: function (name) {
        return {
            id: Date.now(),
            name: name
        };
    }
};
