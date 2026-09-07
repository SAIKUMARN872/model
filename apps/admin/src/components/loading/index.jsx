export default function Loading({
  message = "Loading...",
  description = "Please wait while the requested data is being processed.",
}) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div>
        <span aria-hidden="true">
          ⏳
        </span>

        <h2>{message}</h2>

        <p>{description}</p>
      </div>
    </section>
  );
}