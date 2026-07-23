"use client";


const tools = [

"Search",

"Memory",

"API",

"Database"

];



export default function ToolLibrary({

addTool

}) {


return (

<div className="border rounded-lg p-4">


<h2 className="font-bold text-xl mb-3">

Tool Library

</h2>


<div className="flex gap-3 flex-wrap">


{

tools.map((tool)=>(


<button

key={tool}

onClick={()=>addTool(tool)}

className="px-4 py-2 border rounded"

>

{tool}

</button>


))

}


</div>


</div>

);


}