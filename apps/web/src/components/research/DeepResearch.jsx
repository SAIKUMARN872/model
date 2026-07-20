"use client";


import {useState} from "react";


export default function DeepResearch(){


const [steps,setSteps]=useState([]);



const startResearch=()=>{


setSteps([

"Analyzing topic",

"Collecting sources",

"Generating insights",

"Preparing final answer"

]);


};



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-4">

Deep Research

</h2>



<button

onClick={startResearch}

className="
px-4
py-2
bg-black
text-white
rounded-lg
"

>

Run Deep Research

</button>



<div className="mt-5 space-y-2">


{

steps.map((step,index)=>(


<div

key={index}

className="
p-3
bg-gray-100
rounded-lg
"

>

{index+1}. {step}

</div>


))

}


</div>


</div>

)

}