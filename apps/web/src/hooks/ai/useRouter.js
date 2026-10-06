"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRouter = useRouter;
var react_1 = require("react");
function useRouter() {
    var _a = (0, react_1.useState)(""), route = _a[0], setRoute = _a[1];
    var selectRoute = function (value) {
        setRoute(value);
    };
    return {
        route: route,
        selectRoute: selectRoute
    };
}
