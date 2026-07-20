"use client";

import {useState} from "react";


export default function SpeedControl(){


const [speed,setSpeed]=useState(1);



return(

<div className="p-3">


<label className="font-semibold">

Speech Speed: {speed}x

</label>



<input

type="range"

min="0.5"

max="2"

step="0.1"

value={speed}

onChange={(e)=>setSpeed(e.target.value)}

className="w-full mt-2"

/>


</div>


)

}