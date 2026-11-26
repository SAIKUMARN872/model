export function speak(
text:string
){


if(
typeof window!=="undefined"
&&
"speechSynthesis" in window
){


const speech=
new SpeechSynthesisUtterance(text);


window.speechSynthesis.speak(
speech
);


}


}



export function stopSpeech(){


if(typeof window!=="undefined"){

window.speechSynthesis.cancel();

}


}