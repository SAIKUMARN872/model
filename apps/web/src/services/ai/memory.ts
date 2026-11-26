export const memoryService={


saveMemory(data:any){

localStorage.setItem(
"memory",
JSON.stringify(data)
);

},



getMemory(){

const data=
localStorage.getItem("memory");


return data?
JSON.parse(data):
[];

}


};