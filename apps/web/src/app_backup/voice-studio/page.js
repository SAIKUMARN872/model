"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VoiceStudioPage;
var VoiceRecorder_1 = require("../../components/voice/VoiceRecorder");
var SpeechToText_1 = require("../../components/voice/SpeechToText");
var TextToSpeech_1 = require("../../components/voice/TextToSpeech");
var VoiceWave_1 = require("../../components/voice/VoiceWave");
function VoiceStudioPage() {
    return (<main className="min-h-screen p-8">


      <h1 className="text-3xl font-bold">

        Voice Studio

      </h1>


      <p className="mt-2 text-gray-600">

        AI voice recording, speech recognition and synthesis.

      </p>



      <div className="mt-8 space-y-6">


        <VoiceRecorder_1.default />


        <VoiceWave_1.default />


        <SpeechToText_1.default />


        <TextToSpeech_1.default />


      </div>


    </main>);
}
