export function routeModel(
query:string
){


if(query.length>100){

return "Large Model";

}


return "Fast Model";


}