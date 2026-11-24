"use client";


import {useState} from "react";


export default function TextToSpeech(){


const [text,setText]=useState("");



const speakText=()=>{


if("speechSynthesis" in window){


const speech=new SpeechSynthesisUtterance(text);

window.speechSynthesis.speak(speech);


}


};



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-3">

Text To Speech

</h2>



<textarea

value={text}

onChange={(e)=>setText(e.target.value)}

placeholder="Enter text"

className="w-full p-3 border rounded"

rows="4"

/>



<button

onClick={speakText}

className="mt-4 px-5 py-2 bg-black text-white rounded"

>

Play Voice

</button>


</div>

)


}