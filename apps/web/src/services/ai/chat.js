"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
var client_1 = require("../api/client");
function sendMessage(message) {
    return (0, client_1.apiClient)("/chat", {
        method: "POST",
        body: JSON.stringify({
            message: message
        })
    });
}
