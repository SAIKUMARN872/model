"use client";

import VoiceRecorder from "../../components/voice/VoiceRecorder";
import SpeechToText from "../../components/voice/SpeechToText";
import TextToSpeech from "../../components/voice/TextToSpeech";
import VoiceWave from "../../components/voice/VoiceWave";


export default function VoiceStudioPage() {

  return (

    <main className="min-h-screen p-8">


      <h1 className="text-3xl font-bold">

        Voice Studio

      </h1>


      <p className="mt-2 text-gray-600">

        AI voice recording, speech recognition and synthesis.

      </p>



      <div className="mt-8 space-y-6">


        <VoiceRecorder />


        <VoiceWave />


        <SpeechToText />


        <TextToSpeech />


      </div>


    </main>

  );

}