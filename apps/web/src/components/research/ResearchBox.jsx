"use client";

import { useState } from "react";


export default function ResearchBox(){

const [query,setQuery]=useState("");



const handleResearch=()=>{

console.log("Research Query:",query);

};



return(

<div className="p-5 border rounded-xl space-y-4">


<h2 className="text-xl font-bold">

Research Assistant

</h2>



<input

value={query}

onChange={(e)=>setQuery(e.target.value)}

placeholder="Enter research topic..."

className="
w-full
border
rounded-lg
px-4
py-3
outline-none
"

/>



<button

onClick={handleResearch}

className="
px-5
py-2
bg-black
text-white
rounded-lg
"

>

Start Research

</button>


</div>

)

}