import {useState} from "react";


export function useAIChat(){


const [response,setResponse]=useState("");



const askAI=(question:string)=>{


setResponse(
`AI response for: ${question}`
);


};



return {

response,
askAI

};


}