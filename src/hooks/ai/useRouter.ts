import {useState} from "react";


export function useRouter(){


const [route,setRoute]=useState("");



const selectRoute=(value:string)=>{

setRoute(value);

};



return {

route,
selectRoute

};

}