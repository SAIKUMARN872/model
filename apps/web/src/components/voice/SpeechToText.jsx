"use client";

import { useState } from "react";


export default function SpeechToText(){

const [text,setText]=useState("");
const [listening,setListening]=useState(false);



const startListening=()=>{

setListening(true);


setTimeout(()=>{

setText("Speech converted into text successfully");

setListening(false);

},2000);


};



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-3">

Speech To Text

</h2>


<div className="min-h-20 p-3 bg-gray-100 rounded">

{
text || "Your speech will appear here..."
}

</div>



<button

onClick={startListening}

className="mt-4 px-5 py-2 bg-black text-white rounded"

>

{
listening ? "Listening..." : "Start Speaking"
}

</button>


</div>

)


}