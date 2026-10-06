"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamData = streamData;
function streamData(callback) {
    var interval = setInterval(function () {
        callback({
            message: "stream update"
        });
    }, 1000);
    return function () { return clearInterval(interval); };
}
