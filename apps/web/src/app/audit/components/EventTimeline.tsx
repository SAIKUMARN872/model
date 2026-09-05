export default function EventTimeline() {
  const events = [
    "Login",
    "Model Updated",
    "Prompt Executed"
  ];

  return (
    <div className="rounded-lg border p-5">
      <h2 className="font-semibold mb-3">
        Event Timeline
      </h2>

      <ul className="space-y-2">
        {events.map((event) => (
          <li key={event}>{event}</li>
        ))}
      </ul>
    </div>
  );
}