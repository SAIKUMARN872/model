"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeModel = routeModel;
function routeModel(query) {
    if (query.length > 100) {
        return "Large Model";
    }
    return "Fast Model";
}
