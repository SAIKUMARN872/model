"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDocumentAI = useDocumentAI;
var react_1 = require("react");
function useDocumentAI() {
    var _a = (0, react_1.useState)([]), documents = _a[0], setDocuments = _a[1];
    var addDocument = function (doc) {
        setDocuments(function (prev) { return __spreadArray(__spreadArray([], prev, true), [
            doc
        ], false); });
    };
    return {
        documents: documents,
        addDocument: addDocument
    };
}
