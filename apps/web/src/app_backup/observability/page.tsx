"use client";

import { useState } from "react";


const metrics = [
  {
    name: "API Requests",
    value: "12,540"
  },
  {
    name: "Active Models",
    value: "24"
  },
  {
    name: "Response Time",
    value: "240ms"
  },
  {
    name: "System Health",
    value: "99.9%"
  }
];


export default function ObservabilityPage() {


  const [selected, setSelected] = useState("");


  return (

    <main className="min-h-screen p-8">


      <h1 className="text-3xl font-bold">

        Observability Dashboard

      </h1>


      <p className="mt-2 text-gray-600">

        Monitor AI system performance and application metrics.

      </p>



      <div className="grid md:grid-cols-2 gap-5 mt-8">


        {metrics.map((metric)=>(


          <div

            key={metric.name}

            className="border rounded-lg p-5"

            onClick={()=>setSelected(metric.name)}

          >

            <h2 className="text-lg font-semibold">

              {metric.name}

            </h2>


            <p className="text-2xl mt-3">

              {metric.value}

            </p>


          </div>


        ))}


      </div>



      {selected && (

        <div className="mt-6 border rounded-lg p-4">

          Selected Metric: {selected}

        </div>

      )}



    </main>

  );

}