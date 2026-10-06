"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
var client_1 = require("./api/client");
exports.api = {
    get: function (endpoint) {
        return (0, client_1.apiClient)(endpoint);
    },
    post: function (endpoint, data) {
        return (0, client_1.apiClient)(endpoint, {
            method: "POST",
            body: JSON.stringify(data)
        });
    }
};
