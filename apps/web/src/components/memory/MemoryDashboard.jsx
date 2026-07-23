"use client";

import { useState } from "react";
import ConversationMemory from "./ConversationMemory";
import UserMemory from "./UserMemory";


export default function MemoryDashboard() {


  const [memories,setMemories] = useState([]);



  const addMemory = () => {

    setMemories((prev)=>[

      ...prev,

      "New memory created"

    ]);

  };



  return (

    <div className="p-8 space-y-6">


      <div>

        <h1 className="text-3xl font-bold">

          Memory Dashboard

        </h1>


        <p className="mt-2 text-gray-600">

          Manage AI conversation and user memories.

        </p>

      </div>



      <button

        onClick={addMemory}

        className="px-4 py-2 border rounded"

      >

        Add Memory

      </button>



      <div className="border rounded-lg p-5">

        {

          memories.length === 0 ?

          <p>No memories available</p>

          :

          memories.map((item,index)=>(

            <p key={index}>

              {item}

            </p>

          ))

        }

      </div>



      <ConversationMemory />


      <UserMemory />


    </div>

  );

}