"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.truncateText = truncateText;
exports.generateId = generateId;
exports.sleep = sleep;
exports.classNames = classNames;
function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(new Date(date));
}
function truncateText(text, length) {
    if (length === void 0) { length = 100; }
    if (text.length <= length) {
        return text;
    }
    return text.substring(0, length) + "...";
}
function generateId() {
    return Date.now()
        .toString();
}
function sleep(ms) {
    return new Promise(function (resolve) {
        return setTimeout(resolve, ms);
    });
}
function classNames() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return classes
        .filter(Boolean)
        .join(" ");
}
