"use client";
import { usePathname } from "next/navigation";
import SideBar from "@/components/sidebar";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = pathname.startsWith("/auth");

  return hideLayout ? (
    <main>{children}</main>
  ) : (
    <>
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex flex-col flex-grow ml-0">
                <main className="flex-grow px-4 sm:px-6 py-4">{children}</main>
                <Footer />
            </div>
        </div>
    </>
  );
}