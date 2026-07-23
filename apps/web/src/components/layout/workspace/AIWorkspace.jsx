export default function AIWorkspace({ children }) {
  return (
    <section className="flex flex-col flex-1 bg-gray-50">

      <div className="flex-1 overflow-y-auto p-6">

        {children}

      </div>

    </section>
  );
}