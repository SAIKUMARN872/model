export default function ModelCard({

name,
selected,
onSelect

}){


return(

<div

onClick={onSelect}

className={`
p-4
border
rounded-xl
cursor-pointer
transition

${selected ? "bg-black text-white":"bg-white"}

`}

>


<h3 className="font-bold">

{name}

</h3>


<p className="text-sm mt-2">

Click to select model

</p>


</div>

)

}