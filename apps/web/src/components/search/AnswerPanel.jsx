export default function AnswerPanel({answer}){


return(

<div className="p-5 border rounded-xl">


<h2 className="text-xl font-bold">

Answer

</h2>



<p className="mt-3 text-gray-600">

{

answer ||

"No answer generated yet"

}

</p>


</div>

)

}