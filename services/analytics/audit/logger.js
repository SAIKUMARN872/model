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
exports.AuditLogger = void 0;
var events_1 = require("./events");
var AuditLogger = /** @class */ (function () {
    function AuditLogger(options) {
        if (options === void 0) { options = {}; }
        var _a, _b;
        this.events = [];
        this.maxEvents = (_a = options.maxEvents) !== null && _a !== void 0 ? _a : 100000;
        this.source = (_b = options.source) !== null && _b !== void 0 ? _b : "modelnow-analytics";
    }
    AuditLogger.prototype.log = function (event) {
        var auditEvent = (0, events_1.createAuditEvent)(__assign(__assign({}, event), { source: this.source }));
        this.events.push(auditEvent);
        this.enforceRetention();
        return auditEvent;
    };
    AuditLogger.prototype.success = function (event) {
        return this.log(__assign(__assign({}, event), { outcome: "success" }));
    };
    AuditLogger.prototype.failure = function (event) {
        return this.log(__assign(__assign({}, event), { outcome: "failure" }));
    };
    AuditLogger.prototype.denied = function (event) {
        return this.log(__assign(__assign({}, event), { outcome: "denied" }));
    };
    AuditLogger.prototype.query = function (query) {
        var _a;
        if (query === void 0) { query = {}; }
        var limit = (_a = query.limit) !== null && _a !== void 0 ? _a : 100;
        return this.events
            .filter(function (event) {
            if (query.organizationId &&
                event.organizationId !== query.organizationId) {
                return false;
            }
            if (query.workspaceId &&
                event.workspaceId !== query.workspaceId) {
                return false;
            }
            if (query.userId && event.userId !== query.userId) {
                return false;
            }
            if (query.action && event.action !== query.action) {
                return false;
            }
            if (query.resource && event.resource !== query.resource) {
                return false;
            }
            if (query.resourceId &&
                event.resourceId !== query.resourceId) {
                return false;
            }
            if (query.outcome && event.outcome !== query.outcome) {
                return false;
            }
            if (query.from && event.timestamp < query.from) {
                return false;
            }
            if (query.to && event.timestamp > query.to) {
                return false;
            }
            return true;
        })
            .sort(function (a, b) {
            return b.timestamp.getTime() - a.timestamp.getTime();
        })
            .slice(0, limit);
    };
    AuditLogger.prototype.getById = function (id) {
        return this.events.find(function (event) { return event.id === id; });
    };
    AuditLogger.prototype.count = function (query) {
        if (query === void 0) { query = {}; }
        return this.query(__assign(__assign({}, query), { limit: Number.MAX_SAFE_INTEGER })).length;
    };
    AuditLogger.prototype.clear = function () {
        this.events.length = 0;
    };
    AuditLogger.prototype.enforceRetention = function () {
        var overflow = this.events.length - this.maxEvents;
        if (overflow > 0) {
            this.events.splice(0, overflow);
        }
    };
    return AuditLogger;
}());
exports.AuditLogger = AuditLogger;
