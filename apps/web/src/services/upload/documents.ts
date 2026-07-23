export function uploadDocument(
file:File
){


const data=new FormData();


data.append(
"document",
file
);


return data;


}