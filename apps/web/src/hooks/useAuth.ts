import {useState} from "react";


export function useAuth(){

const [user,setUser]=useState<any>(null);


const login=(data:any)=>{

setUser(data);

localStorage.setItem(
"user",
JSON.stringify(data)
);

};



const logout=()=>{

setUser(null);

localStorage.removeItem("user");

};



return {

user,
login,
logout,
isAuthenticated:!!user

};

}