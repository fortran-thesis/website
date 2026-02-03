"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const hideLayout = pathname.startsWith("/auth") || pathname.startsWith("/support") || pathname.startsWith("/wikimold") || pathname.startsWith("/faq") || pathname.startsWith("/terms-of-agreement") || pathname.startsWith("/privacy-policy") || pathname.startsWith("/about") || pathname == "/";

  // Determine user role - backend returns lowercase 'admin' or 'mycologist'
  const userRole = authUser?.user?.role ? authUser.user.role.charAt(0).toUpperCase() + authUser.user.role.slice(1).toLowerCase() : "Mycologist";

  return hideLayout ? (
    <main>{children}</main>
  ) : (
    <>
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar userRole={userRole} />

            {/* Main content */}
            <div className="flex flex-col flex-grow min-w-0">
                <main className="flex-grow px-4 sm:px-6 py-4 overflow-x-auto">{children}</main>
                <Footer />
            </div>
        </div> 
    </>
  );
}