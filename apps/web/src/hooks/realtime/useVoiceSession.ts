import {useState} from "react";


export function useVoiceSession(){


const [active,setActive]=useState(false);



const startSession=()=>{

setActive(true);

};



const endSession=()=>{

setActive(false);

};



return {

active,
startSession,
endSession

};

}