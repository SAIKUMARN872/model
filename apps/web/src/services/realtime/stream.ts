export function streamData(
callback:(data:any)=>void
){

const interval=setInterval(()=>{


callback({
message:"stream update"
});


},1000);


return ()=>clearInterval(interval);


}