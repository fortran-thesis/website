"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = pathname.startsWith("/auth") || pathname.startsWith("/support") || pathname == "/";

  return hideLayout ? (
    <main>{children}</main>
  ) : (
    <>
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex flex-col flex-grow min-w-0">
                <main className="flex-grow px-4 sm:px-6 py-4 overflow-x-auto">{children}</main>
                <Footer />
            </div>
        </div>
    </>
  );
}