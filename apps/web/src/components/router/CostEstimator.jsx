"use client";

import {useState} from "react";


export default function CostEstimator(){


const [tokens,setTokens]=useState(0);



const cost=(tokens*0.002).toFixed(3);



return(

<div className="p-5 border rounded-xl">


<h2 className="font-bold text-xl">

Cost Estimator

</h2>



<input

type="number"

value={tokens}

onChange={(e)=>setTokens(e.target.value)}

placeholder="Enter tokens"

className="
border
rounded-lg
p-2
mt-3
w-full
"

/>



<p className="mt-3">

Estimated Cost: ${cost}

</p>


</div>

)

}