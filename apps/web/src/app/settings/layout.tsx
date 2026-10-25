
import type { ReactNode } from "react";
import SettingsSidebar from "../../components/settings/SettingsSidebar";

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 md:flex">
      <SettingsSidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
