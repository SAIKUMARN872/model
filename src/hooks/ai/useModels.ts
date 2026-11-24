import {useState} from "react";


export function useAIModels(){


const [models,setModels]=useState([

"GPT",
"Claude",
"Llama"

]);



return {

models,
setModels

};

}