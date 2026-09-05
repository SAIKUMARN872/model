export default function Button({
  children,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`rounded-md bg-black px-4 py-2 text-white hover:opacity-90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}