"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAccountConfig = loadAccountConfig;
function loadAccountConfig() {
    var _a, _b, _c;
    return {
        port: Number((_a = process.env.ACCOUNT_PORT) !== null && _a !== void 0 ? _a : 4010),
        host: (_b = process.env.ACCOUNT_HOST) !== null && _b !== void 0 ? _b : "0.0.0.0",
        environment: (_c = process.env.NODE_ENV) !== null && _c !== void 0 ? _c : "development",
    };
}
