"use client";


import {useEffect,useState} from "react";


export default function VoiceVisualizer(){


const [levels,setLevels]=useState(

[20,40,60,30,50,70,40]

);



useEffect(()=>{


const interval=setInterval(()=>{


setLevels(

levels.map(()=>


Math.floor(Math.random()*80)+20


)

);


},500);



return()=>clearInterval(interval);



},[levels]);



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-5">

Voice Visualizer

</h2>



<div className="
flex
items-end
justify-center
gap-2
h-32
">


{

levels.map((level,index)=>(


<div

key={index}

style={{

height:`${level}%`

}}

className="
w-3
bg-black
rounded-full
transition-all
duration-300
"


>

</div>


))


}


</div>


</div>


)

}