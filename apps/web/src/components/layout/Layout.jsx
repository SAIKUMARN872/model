import TopNavbar from "./header/TopNavbar";
import MainSidebar from "./sidebar/MainSidebar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <MainSidebar />

      <div className="flex flex-col flex-1">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}