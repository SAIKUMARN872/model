export const APP_NAME = "AI Platform";


export const API_BASE_URL =
process.env.NEXT_PUBLIC_API_URL ||
"http://localhost:8000";


export const ROUTES = {

HOME:"/",

CHAT:"/chat",

DASHBOARD:"/dashboard",

MODELS:"/models",

RESEARCH:"/research",

SETTINGS:"/settings"

};



export const AI_MODELS = [

{

id:"gpt",

name:"GPT Model"

},

{

id:"claude",

name:"Claude Model"

},

{

id:"llama",

name:"Llama Model"

}

];



export const STORAGE_KEYS = {

TOKEN:"token",

USER:"user",

CHAT:"chat_history"

};