export const modelService={


getModels(){

return [

"GPT",
"Claude",
"Llama"

];

},



selectModel(model:string){

return {

selected:model

};

}


};