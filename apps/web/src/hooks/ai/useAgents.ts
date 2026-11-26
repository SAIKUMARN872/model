import {useState} from "react";


export function useAgents(){


const [agents,setAgents]=useState<any[]>([]);



const addAgent=(agent:any)=>{


setAgents(prev=>[
...prev,
agent
]);


};



return {

agents,
addAgent

};


}