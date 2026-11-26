import {useState} from "react";


export function useChat(){


const [messages,setMessages]=useState<any[]>([]);



const sendMessage=(message:string)=>{


setMessages(prev=>[

...prev,

{
role:"user",
content:message
}

]);


};



return {

messages,
sendMessage

};

}