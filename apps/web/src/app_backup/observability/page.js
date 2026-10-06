"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ObservabilityPage;
var react_1 = require("react");
var metrics = [
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
function ObservabilityPage() {
    var _a = (0, react_1.useState)(""), selected = _a[0], setSelected = _a[1];
    return (<main className="min-h-screen p-8">


      <h1 className="text-3xl font-bold">

        Observability Dashboard

      </h1>


      <p className="mt-2 text-gray-600">

        Monitor AI system performance and application metrics.

      </p>



      <div className="grid md:grid-cols-2 gap-5 mt-8">


        {metrics.map(function (metric) { return (<div key={metric.name} className="border rounded-lg p-5" onClick={function () { return setSelected(metric.name); }}>

            <h2 className="text-lg font-semibold">

              {metric.name}

            </h2>


            <p className="text-2xl mt-3">

              {metric.value}

            </p>


          </div>); })}


      </div>



      {selected && (<div className="mt-6 border rounded-lg p-4">

          Selected Metric: {selected}

        </div>)}



    </main>);
}
