"use client";

import { useState } from "react";


const models = [
  {
    name: "GPT Model",
    type: "Language Model",
    description: "Advanced conversational AI model."
  },
  {
    name: "Claude Model",
    type: "Assistant",
    description: "AI model for reasoning and analysis."
  },
  {
    name: "Llama Model",
    type: "Open Source",
    description: "Open AI model for developers."
  }
];


export default function AIMarketplacePage() {


  const [selected, setSelected] = useState("");



  return (

    <main className="min-h-screen p-8">


      <h1 className="text-3xl font-bold">

        AI Marketplace

      </h1>


      <p className="mt-2 text-gray-600">

        Explore and select AI models.

      </p>



      <div className="grid gap-5 mt-8">


        {models.map((model)=>(


          <div

            key={model.name}

            className="border rounded-lg p-5"

          >


            <h2 className="text-xl font-semibold">

              {model.name}

            </h2>


            <p>

              {model.type}

            </p>


            <p className="mt-2">

              {model.description}

            </p>


            <button

              onClick={()=>setSelected(model.name)}

              className="mt-4 px-4 py-2 rounded border"

            >

              Select Model

            </button>


          </div>


        ))}


      </div>



      {selected && (

        <div className="mt-6 border rounded p-4">

          Selected: {selected}

        </div>

      )}


    </main>

  );

}