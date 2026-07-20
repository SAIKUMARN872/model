"use client";


export default function AgentCanvas({

tools=[]

}){


return (

<div className="border rounded-lg p-5">


<h2 className="text-xl font-bold mb-3">

Agent Canvas

</h2>



{

tools.length===0 ?

<p>No tools added</p>

:

tools.map((tool,index)=>(

<div

key={index}

className="border p-3 rounded mb-2"

>

{tool}

</div>


))

}


</div>

);


}