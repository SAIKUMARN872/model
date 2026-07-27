"use client";

import { useState, useRef } from "react";


export default function VoiceRecorder(){

    const [recording,setRecording] = useState(false);
    const [audioURL,setAudioURL] = useState(null);

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);



    const startRecording = async()=>{

        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true
        });


        mediaRecorder.current = new MediaRecorder(stream);


        audioChunks.current = [];


        mediaRecorder.current.ondataavailable = (event)=>{

            audioChunks.current.push(event.data);

        };


        mediaRecorder.current.onstop = ()=>{

            const audioBlob = new Blob(
                audioChunks.current,
                {
                    type:"audio/wav"
                }
            );


            const url = URL.createObjectURL(audioBlob);

            setAudioURL(url);

        };


        mediaRecorder.current.start();

        setRecording(true);

    };





    const stopRecording = ()=>{

        if(mediaRecorder.current){

            mediaRecorder.current.stop();

            setRecording(false);

        }

    };



    return(

        <div className="p-5 border rounded-xl">


            <h2 className="text-xl font-bold mb-4">
                Voice Recorder
            </h2>



            <div className="flex gap-4">


            {!recording ? (

                <button

                onClick={startRecording}

                className="
                px-5
                py-2
                bg-black
                text-white
                rounded-lg
                "

                >

                Start Recording

                </button>


            ):(


                <button

                onClick={stopRecording}

                className="
                px-5
                py-2
                bg-red-600
                text-white
                rounded-lg
                "

                >

                Stop Recording

                </button>


            )}


            </div>




            {
            audioURL && (

                <div className="mt-5">

                    <audio

                    controls

                    src={audioURL}

                    />

                </div>

            )
            }



        </div>

    )


}