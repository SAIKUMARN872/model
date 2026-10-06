"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountEventBus = void 0;
var node_events_1 = require("node:events");
var AccountEventBus = /** @class */ (function () {
    function AccountEventBus() {
        this.emitter = new node_events_1.EventEmitter();
    }
    AccountEventBus.prototype.publish = function (type, data) {
        var event = {
            id: crypto.randomUUID(),
            type: type,
            timestamp: new Date().toISOString(),
            data: data,
        };
        this.emitter.emit(type, event);
        this.emitter.emit("*", event);
        return event;
    };
    AccountEventBus.prototype.subscribe = function (listener) {
        var _this = this;
        this.emitter.on("*", listener);
        return function () {
            _this.emitter.off("*", listener);
        };
    };
    return AccountEventBus;
}());
exports.AccountEventBus = AccountEventBus;
