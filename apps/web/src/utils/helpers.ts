export function formatDate(
date:string|Date
){

return new Intl.DateTimeFormat(
"en-US",
{

year:"numeric",

month:"short",

day:"numeric"

}

).format(new Date(date));

}



export function truncateText(
text:string,
length:number=100
){

if(text.length<=length){

return text;

}


return text.substring(
0,
length
)+"...";

}



export function generateId(){

return Date.now()
.toString();

}



export function sleep(
ms:number
){

return new Promise(
(resolve)=>
setTimeout(resolve,ms)
);

}



export function classNames(
...classes:string[]
){

return classes
.filter(Boolean)
.join(" ");

}