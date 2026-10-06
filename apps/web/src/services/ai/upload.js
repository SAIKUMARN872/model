"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAIFile = uploadAIFile;
function uploadAIFile(file) {
    var formData = new FormData();
    formData.append("file", file);
    return formData;
}
