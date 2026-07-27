export const agentService={


getAgents(){

return [

{
id:1,
name:"Research Agent"
},

{
id:2,
name:"Voice Agent"
}

];

},



createAgent(name:string){

return {

id:Date.now(),
name

};

}


};