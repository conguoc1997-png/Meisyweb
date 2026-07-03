import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BackupReminder from "@/components/BackupReminder";
import { UserProvider } from "@/lib/user-context";

export const metadata: Metadata = {
  title: "Meisy Inhouse",
  description: "Quản lý TMĐT thời trang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full flex bg-slate-50">
        <UserProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          <BackupReminder />
        </UserProvider>
      </body>
    </html>
  );
}
