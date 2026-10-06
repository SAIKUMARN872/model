"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.speak = speak;
exports.stopSpeech = stopSpeech;
function speak(text) {
    if (typeof window !== "undefined"
        &&
            "speechSynthesis" in window) {
        var speech = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speech);
    }
}
function stopSpeech() {
    if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
    }
}
