"use client";


import {useState} from "react";


export default function VoiceMode(){


const [mode,setMode]=useState("Normal");



const modes=[
"Normal",
"Assistant",
"Recording"
];



return(

<div className="p-4 border rounded-xl">


<h3 className="font-bold mb-3">

Voice Mode

</h3>



<div className="flex gap-3">


{
modes.map((item)=>(


<button

key={item}

onClick={()=>setMode(item)}

className={`
px-4
py-2
rounded-lg
border

${mode===item 
? "bg-black text-white"
:"bg-white"}

`}

>

{item}

</button>


))

}


</div>



<p className="mt-3">

Current Mode: {mode}

</p>


</div>


)

}