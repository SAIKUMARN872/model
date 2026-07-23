import {apiClient} from "./api/client";


export const api={


get(endpoint:string){

return apiClient(endpoint);

},


post(endpoint:string,data:any){

return apiClient(
endpoint,
{
method:"POST",
body:JSON.stringify(data)
}
);

}


};