"use client";

import {useState} from "react";
import RouteDecision from "./RouteDecision";
import ModelCard from "./ModelCard";


export default function ModelRouter(){


const [model,setModel]=useState("");


const models=[

"GPT Model",
"Claude Model",
"Llama Model"

];



return(

<div className="p-5 border rounded-xl space-y-5">


<h2 className="text-2xl font-bold">

AI Model Router

</h2>



<div className="grid md:grid-cols-3 gap-4">


{

models.map((item)=>(


<ModelCard

key={item}

name={item}

selected={model===item}

onSelect={()=>setModel(item)}

/>


))

}


</div>



<RouteDecision model={model}/>


</div>

)

}