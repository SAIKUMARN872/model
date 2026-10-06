"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditEvent = createAuditEvent;
function createAuditEvent(input) {
    return __assign(__assign({}, input), { id: generateAuditId(), timestamp: new Date() });
}
function generateAuditId() {
    return "audit_".concat(Date.now(), "_").concat(Math.random()
        .toString(36)
        .slice(2, 10));
}
