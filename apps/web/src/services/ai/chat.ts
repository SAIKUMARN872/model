import {apiClient} from "../api/client";


export function sendMessage(message:string){

return apiClient(
"/chat",
{
method:"POST",
body:JSON.stringify({
message
})
}
);

}