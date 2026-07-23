"use client";

import {useState} from "react";


export default function SearchBox(){

const [query,setQuery]=useState("");



const handleSearch=()=>{

console.log("Searching:",query);

};



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-4">

AI Search

</h2>



<div className="flex gap-3">


<input

value={query}

onChange={(e)=>setQuery(e.target.value)}

placeholder="Search anything..."

className="
flex-1
border
rounded-lg
px-4
py-2
"

/>



<button

onClick={handleSearch}

className="
bg-black
text-white
px-5
rounded-lg
"

>

Search

</button>


</div>


</div>

)

}