"use client";

import {useState,useEffect} from "react";


export default function LatencyMeter(){


const [latency,setLatency]=useState(0);



useEffect(()=>{


const timer=setInterval(()=>{


setLatency(

Math.floor(Math.random()*200)+50

);


},1000);



return()=>clearInterval(timer);


},[]);



return(

<div className="p-4 border rounded-xl">


<h3 className="font-bold">

Latency Meter

</h3>


<p className="mt-2">

{latency} ms

</p>


</div>

)

}