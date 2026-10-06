"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocument = uploadDocument;
function uploadDocument(file) {
    var data = new FormData();
    data.append("document", file);
    return data;
}
