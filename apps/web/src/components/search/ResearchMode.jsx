"use client";


import {useState} from "react";


export default function ResearchMode(){


const [mode,setMode]=useState("Quick");



return(

<div className="p-5 border rounded-xl">


<h2 className="font-bold text-xl">

Research Mode

</h2>



<div className="flex gap-3 mt-4">


<button

onClick={()=>setMode("Quick")}

className={`
px-4
py-2
rounded-lg
border

${mode==="Quick" 
? "bg-black text-white"
:""}

`}

>

Quick

</button>



<button

onClick={()=>setMode("Deep")}

className={`
px-4
py-2
rounded-lg
border

${mode==="Deep"
? "bg-black text-white"
:""}

`}

>

Deep

</button>


</div>



<p className="mt-3">

Current Mode: {mode}

</p>


</div>

)

}