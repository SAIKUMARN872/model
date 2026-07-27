export default function AdminForm({
  title = "Configuration Form",
  description = "Manage platform configuration and administrative settings.",
  children,
  onSubmit,
  submitLabel = "Save Changes",
}) {
  const handleSubmit = (event) => {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(event);
    }
  };

  return (
    <section>
      <header>
        <h2>{title}</h2>

        <p>{description}</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div>{children}</div>

        <button type="submit">
          {submitLabel}
        </button>
      </form>
    </section>
  );
}