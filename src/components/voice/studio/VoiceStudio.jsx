"use client";


import SpeechToText from "../SpeechToText";
import TextToSpeech from "../TextToSpeech";
import VoiceRecorder from "../VoiceRecorder";
import VoiceWave from "../VoiceWave";


export default function VoiceStudio(){


return(

<div className="space-y-6">


<h1 className="text-3xl font-bold">

Voice Studio

</h1>



<div className="
grid
grid-cols-1
md:grid-cols-2
gap-6
">


<SpeechToText />


<TextToSpeech />


<VoiceRecorder />


<VoiceWave />


</div>



</div>

)


}