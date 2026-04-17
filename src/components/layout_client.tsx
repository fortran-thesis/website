"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { useFCM } from "@/hooks/useFCM";
import { useRouteChangeRevalidate } from "@/hooks/use-route-change-revalidate";
import SwrProvider from "@/providers/swr-provider";
import { AuthProvider } from "@/providers/auth-provider";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <AuthProvider>
      <SwrProvider>
        <LayoutInner pathname={pathname}>{children}</LayoutInner>
      </SwrProvider>
    </AuthProvider>
  );
}

/** Inner component that consumes useAuth (now backed by the shared AuthProvider) */
function LayoutInner({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  // Revalidate SWR caches on route changes for fresh data on back navigation
  useRouteChangeRevalidate();

  const { user: authUser } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const routeStartRef = useRef<number | null>(null);
  const hasRequestedFcmRef = useRef(false);
  const hideLayout = pathname.startsWith("/auth") || pathname.startsWith("/support") || pathname.startsWith("/wikimold") || pathname.startsWith("/faq") || pathname.startsWith("/terms-of-agreement") || pathname.startsWith("/privacy-policy") || pathname.startsWith("/about") || pathname == "/";

  // Determine user role - backend returns lowercase 'admin' or 'mycologist'
  const userRole = authUser?.user?.role ? authUser.user.role.charAt(0).toUpperCase() + authUser.user.role.slice(1).toLowerCase() : "Mycologist";

  // ── FCM: initialise web push when the user is logged in ──
  const { requestPermission } = useFCM();

  useEffect(() => {
    if (authUser && !hasRequestedFcmRef.current) {
      hasRequestedFcmRef.current = true;
      requestPermission();
    }
  }, [authUser, requestPermission]);

  useEffect(() => {
    if (hideLayout || typeof window === 'undefined' || typeof window.performance === 'undefined') return;

    const startAt = routeStartRef.current ?? window.performance.now();
    routeStartRef.current = null;
    const measureName = `route:${pathname}:paint`;

    const raf = window.requestAnimationFrame(() => {
      const endAt = window.performance.now();

      try {
        window.performance.measure(measureName, { start: startAt, end: endAt });
      } catch {
        // Older browsers may only accept mark names; the baseline still exists via the timestamp.
      }

      if (process.env.NODE_ENV !== 'production') {
        const entries = window.performance.getEntriesByName(measureName);
        const entry = entries[entries.length - 1];
        if (entry) {
          console.info(`[perf] ${measureName}=${entry.duration.toFixed(1)}ms`);
        }
      }
    });

    return () => window.cancelAnimationFrame(raf);
  }, [hideLayout, pathname]);

  // Hide the loading bar once the pathname settles (covers all navigation types
  // including router.back(), router.push(), and <Link> clicks).
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Show the loading bar on <Link> / <a> clicks for immediate feedback.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const linkElement = target.closest('a[href^="/"]');
      if (linkElement && !hideLayout) {
        const href = linkElement.getAttribute('href');
        if (href && href !== pathname && !href.startsWith('http')) {
          routeStartRef.current = window.performance.now();
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname, hideLayout]);

  // Show the loading bar on programmatic navigation (router.push / router.back).
  // We detect this by watching for the pathname to start changing: set navigating
  // true immediately before the new pathname resolves.
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // pathname just changed — the navigation completed, hide the bar.
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {hideLayout ? (
        <main>{children}</main>
      ) : (
        <>
            {/* Top Loading Bar */}
        {isNavigating && (
          <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
            <div 
              className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
              style={{ width: '30%' }}
            />
          </div>
        )}

        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-0 xl:w-auto">
              {isMounted ? (
                <Sidebar userRole={userRole} />
              ) : (
                <div className="hidden xl:block w-[280px]" aria-hidden="true" />
              )}
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-grow min-w-0">
              <main className="flex-grow px-4 sm:px-6 py-4 overflow-x-visible">{children}</main>
                <Footer />
            </div>
        </div> 
        </>
      )}
    </>
  );
}