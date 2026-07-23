"use client";


import {useState} from "react";


export default function AnswerComposer(){


const [answer,setAnswer]=useState("");



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-3">

Answer Composer

</h2>



<textarea

value={answer}

onChange={(e)=>setAnswer(e.target.value)}

placeholder="Write research answer..."

rows="6"

className="
w-full
border
rounded-lg
p-3
"

/>



<div className="mt-3">


<button

className="
px-5
py-2
bg-black
text-white
rounded-lg
"

>

Save Answer

</button>


</div>


</div>

)

}