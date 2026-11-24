import {useState} from "react";


export function useStreamingChat(){


const [stream,setStream]=useState<string[]>([]);



const addChunk=(chunk:string)=>{


setStream(prev=>[
...prev,
chunk
]);


};



return {

stream,
addChunk

};

}