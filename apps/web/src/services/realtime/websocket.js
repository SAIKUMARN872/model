"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocket = createSocket;
function createSocket(url) {
    return new WebSocket(url);
}
