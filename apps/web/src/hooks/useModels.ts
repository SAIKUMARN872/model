import {useState} from "react";


export function useModels(){


const [model,setModel]=useState(
"GPT"
);



return {

model,
setModel

};

}