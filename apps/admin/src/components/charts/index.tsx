export default function CommonPanel({
  title = "ModelNow Admin",
  description = "Enterprise administration and platform management",
  children,
}) {
  return (
    <section>
      <header>
        <h2>{title}</h2>

        <p>{description}</p>
      </header>

      <div>{children}</div>
    </section>
  );
}