"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
var zustand_1 = require("zustand");
exports.useAuthStore = (0, zustand_1.create)(function (set) { return ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: function (user, token) {
        return set({
            user: user,
            token: token,
            isAuthenticated: true
        });
    },
    logout: function () {
        return set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    }
}); });
