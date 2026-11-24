export const authService={


login(email:string,password:string){

return {

email,
password,
token:"demo-token"

};

},



logout(){

localStorage.removeItem("token");

},



getToken(){

return localStorage.getItem("token");

}


};