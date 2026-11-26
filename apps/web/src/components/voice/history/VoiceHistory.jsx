"use client";

import {useState} from "react";


export default function VoiceHistory(){

const [history,setHistory]=useState([

{
id:1,
text:"Hello, how can I help you?",
time:"10:30 AM"
},

{
id:2,
text:"Explain artificial intelligence",
time:"11:15 AM"
},

{
id:3,
text:"Generate voice response",
time:"12:00 PM"
}

]);



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-4">

Voice History

</h2>



<div className="space-y-3">


{
history.map((item)=>(


<div

key={item.id}

className="
p-3
rounded-lg
bg-gray-100
"


>


<p className="font-medium">

{item.text}

</p>


<span className="text-sm text-gray-500">

{item.time}

</span>


</div>


))

}


</div>


</div>

)


}