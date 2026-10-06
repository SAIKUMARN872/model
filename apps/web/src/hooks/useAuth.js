"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = useAuth;
var react_1 = require("react");
function useAuth() {
    var _a = (0, react_1.useState)(null), user = _a[0], setUser = _a[1];
    var login = function (data) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
    };
    var logout = function () {
        setUser(null);
        localStorage.removeItem("user");
    };
    return {
        user: user,
        login: login,
        logout: logout,
        isAuthenticated: !!user
    };
}
