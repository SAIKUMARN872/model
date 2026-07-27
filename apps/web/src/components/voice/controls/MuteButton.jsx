"use client";

import {useState} from "react";


export default function MuteButton(){

const [muted,setMuted]=useState(false);



return(

<button

onClick={()=>setMuted(!muted)}

className="
px-4
py-2
rounded-lg
bg-black
text-white
"

>

{
muted ? "Unmute 🔊" : "Mute 🔇"
}


</button>


)

}