export default function SourceCard({title,url}){


return(

<div className="p-4 border rounded-xl">


<h3 className="font-bold">

{title || "Source"}

</h3>



<p className="text-sm text-gray-500 mt-2">

{url || "Source link"}

</p>


<button

className="
mt-3
px-4
py-2
bg-black
text-white
rounded-lg
"

>

Open Source

</button>


</div>

)

}