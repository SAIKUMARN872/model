import {useState} from "react";


export function useVoiceAI(){


const [speaking,setSpeaking]=useState(false);



const startVoice=()=>{

setSpeaking(true);

};



const stopVoice=()=>{

setSpeaking(false);

};



return {

speaking,
startVoice,
stopVoice

};

}