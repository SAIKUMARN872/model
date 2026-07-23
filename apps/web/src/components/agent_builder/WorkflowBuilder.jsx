"use client";

import { useState } from "react";
import AgentCanvas from "./AgentCanvas";
import AgentMemory from "./AgentMemory";
import ToolLibrary from "./ToolLibrary";


export default function WorkflowBuilder() {


  const [tools, setTools] = useState([]);



  const addTool = (tool) => {

    setTools((prev) => [

      ...prev,

      tool

    ]);

  };



  return (

    <div className="p-6 space-y-6">


      <div>

        <h1 className="text-3xl font-bold">

          AI Agent Workflow Builder

        </h1>


        <p className="text-gray-600">

          Design, configure and manage AI agents.

        </p>

      </div>



      <ToolLibrary addTool={addTool} />


      <AgentCanvas tools={tools} />


      <AgentMemory />


    </div>

  );

}