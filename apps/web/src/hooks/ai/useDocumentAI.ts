import {useState} from "react";


export function useDocumentAI(){


const [documents,setDocuments]=useState<any[]>([]);



const addDocument=(doc:any)=>{


setDocuments(prev=>[
...prev,
doc
]);


};



return {

documents,
addDocument

};


}