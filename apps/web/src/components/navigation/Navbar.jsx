export default function Navbar() {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          AI Dashboard
        </h1>

        <nav className="flex gap-6">
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/chat">Chat</a>
          <a href="/settings">Settings</a>
        </nav>
      </div>
    </header>
  );
}