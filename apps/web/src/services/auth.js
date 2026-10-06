"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
exports.authService = {
    login: function (email, password) {
        return {
            email: email,
            password: password,
            token: "demo-token"
        };
    },
    logout: function () {
        localStorage.removeItem("token");
    },
    getToken: function () {
        return localStorage.getItem("token");
    }
};
