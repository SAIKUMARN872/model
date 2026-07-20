export default function SourceTimeline(){


const sources=[

{
title:"Research Paper",
date:"Today"
},

{
title:"Web Source",
date:"Yesterday"
},

{
title:"AI Summary",
date:"Earlier"
}

];



return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold mb-4">

Source Timeline

</h2>



<div className="space-y-3">


{

sources.map((source,index)=>(


<div

key={index}

className="
border-l-4
pl-4
py-2
"

>


<h3 className="font-semibold">

{source.title}

</h3>


<p className="text-sm text-gray-500">

{source.date}

</p>


</div>


))

}


</div>


</div>

)

}