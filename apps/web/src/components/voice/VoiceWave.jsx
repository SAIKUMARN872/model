"use client";

import {useEffect,useState} from "react";


export default function VoiceWave(){

const [active,setActive] = useState(false);


useEffect(()=>{


const timer=setInterval(()=>{

setActive(prev=>!prev);

},500);



return()=>clearInterval(timer);


},[]);



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-5">

Voice Wave

</h2>



<div className="flex items-center justify-center gap-2 h-20">


{
[1,2,3,4,5,6,7].map((item)=>(


<div

key={item}

className={`
w-2
rounded-full
transition-all
duration-300
bg-black

${active ? "h-16":"h-6"}

`}

>


</div>


))

}



</div>


</div>


)


}