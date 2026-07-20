export default function RouteDecision({model}){


return(

<div className="p-4 bg-gray-100 rounded-xl">


<h3 className="font-bold">

Routing Decision

</h3>



<p className="mt-2">

{

model

?

`Selected route: ${model}`

:

"Waiting for model selection"

}

</p>


</div>

)

}