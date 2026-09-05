"use client";

export default function CostOptimizationPage() {
  const services = [
    { name: "GPT-4", cost: "$245", savings: "18%" },
    { name: "Claude", cost: "$180", savings: "12%" },
    { name: "Gemini", cost: "$132", savings: "20%" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Cost Optimization
      </h1>

      <div className="space-y-4">
        {services.map((item) => (
          <div
            key={item.name}
            className="border rounded-lg p-4 flex justify-between"
          >
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p>Monthly Cost: {item.cost}</p>
            </div>

            <span className="text-green-600 font-semibold">
              {item.savings} Saved
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}