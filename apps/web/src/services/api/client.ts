const BASE_URL =
process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export async function apiClient(
endpoint:string,
options:RequestInit={}
){

const response = await fetch(
`${BASE_URL}${endpoint}`,
{
headers:{
"Content-Type":"application/json",
},
...options
}
);


if(!response.ok){

throw new Error(
`API Error: ${response.status}`
);

}


return response.json();

}