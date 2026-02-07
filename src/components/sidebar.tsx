"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouseChimney, faClipboard, faTriangleExclamation, faGear, faRightFromBracket, faBars, faUsers, faBookOpen, faSeedling, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { usePathname, useRouter } from 'next/navigation';
import { useLogout } from '@/hooks/useLogout';

const MoldifyLogo = '/assets/Moldify_Logo.png';

// This is the sidebar component that contains navigation links to different 
// sections of the application.
// It is responsive and can be toggled on smaller screens.

interface SidebarProps {
    userRole?: string;
}

export default function Sidebar({ userRole = "Administrator" }: SidebarProps) {
    const [navOpen, setNavOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const logout = useLogout();

    // Normalize role comparison - handle both "Admin"/"Administrator" and "Mycologist"
    const normalizeRole = (role: string): string => {
        if (!role) return "Mycologist";
        const lowerRole = role.toLowerCase();
        return lowerRole === "admin" || lowerRole === "administrator" ? "Administrator" : "Mycologist";
    };

    const normalizedRole = normalizeRole(userRole);
    const isAdministrator = normalizedRole === "Administrator";
    const isMycologist = normalizedRole === "Mycologist";

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
    };

    //Detect scroll
    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1280;
            setIsDesktop(desktop);
            if (!desktop) {
                setIsCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!isMounted || !isDesktop) return;
        const saved = window.localStorage.getItem("sidebarCollapsed");
        if (saved === "true") {
            setIsCollapsed(true);
        }
    }, [isDesktop, isMounted]);

    useEffect(() => {
        if (!isMounted || !isDesktop) return;
        window.localStorage.setItem("sidebarCollapsed", String(isCollapsed));
    }, [isCollapsed, isDesktop, isMounted]);

    const isCollapsedEffective = isMounted && isCollapsed && isDesktop;

    return (
        <>
            <div
            className={`xl:hidden fixed top-0 left-0 w-full h-14 z-50 flex items-center justify-between px-4 transition-all duration-300
                ${scrolled ? "bg-[var(--primary-color)]/95 shadow-md backdrop-blur-sm" : "bg-transparent"}
            `}
            ></div>
            <button 
                className="xl:hidden fixed top-4 left-4 z-50"
                onClick={() => setNavOpen(true)}
                aria-label="Open navigation">
                <FontAwesomeIcon icon={faBars} className={`cursor-pointer ${scrolled ? "text-[var(--background-color)]" : "text-[var(--primary-color)]"}`} style={{ width: "1.5rem", height: "1.5rem" }} />
            </button>

            {navOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 xl:hidden" onClick={() => setNavOpen(false)} />
            )}

                 <div
                    className={`relative xl:flex-shrink-0 overflow-visible bg-[var(--primary-color)] w-[280px] z-50 xl:sticky xl:top-0 xl:h-screen fixed top-0 left-0 h-full transform transition-transform duration-300 
                ${navOpen ? "translate-x-0" : "-translate-x-full"} 
                    ${isCollapsedEffective ? "xl:w-[88px]" : "xl:w-[280px]"}
                xl:translate-x-0 xl:static
                `}
            >
            <nav className="text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] flex flex-col h-full">
                {/* Top Branding */}
                    <div className={`flex items-start ${isCollapsedEffective ? "justify-center" : "justify-between"} gap-4 p-6`}>
                        <div className={`flex items-start gap-4 ${isCollapsedEffective ? "justify-center" : ""}`}>
                    <Image 
                        src={MoldifyLogo} 
                        alt="Moldify Logo" 
                            width={isCollapsedEffective ? 40 : 60} 
                            height={isCollapsedEffective ? 40 : 60} 
                    />
                        {!isCollapsedEffective && (
                        <div className="flex flex-col justify-center">
                            <h2 className="text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-black text-2xl">MOLDIFY</h2>
                            <p className="text-[var(--background-color)] text-xs font-[family-name:var(--font-bricolage-grotesque)]">Identify mold with Moldify</p>
                        </div>
                    )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="hidden xl:flex items-center justify-center absolute top-4 right-0 translate-x-1/2 rounded-full text-xs  bg-[var(--background-color)] border-2 border-[var(--primary-color)]/30 text-[var(--primary-color)] w-7 h-7 hover:brightness-110 transition cursor-pointer"
                    aria-label={isCollapsedEffective ? "Expand sidebar" : "Collapse sidebar"}
                    title={isCollapsedEffective ? "Expand" : "Collapse"}
                >
                    <FontAwesomeIcon icon={isCollapsedEffective ? faChevronRight : faChevronLeft} />
                </button>

                <div className="h-px bg-[#576146] w-full mb-2" />

                {/* Navigation Container: fills vertical space */}
                <div className="flex flex-col justify-between h-full mt-4">
                    {/* Top Links */}
                    <div className = "flex flex-col gap-y-4">
                        <SidebarLink icon={faHouseChimney} 
                            text="Dashboard" 
                            href="/dashboard"
                            collapsed={isCollapsedEffective} />
                        
                        {isAdministrator && (
                            <SidebarLink icon={faUsers} 
                                text="User Management" 
                                href="/user"
                                collapsed={isCollapsedEffective} />
                        )}
                        
                        <SidebarLink icon={faSeedling} 
                            text="Case Management"
                            href="/investigation"
                            collapsed={isCollapsedEffective} />
                        
                        {isMycologist && (
                            <SidebarLink icon={faBookOpen} 
                                text="Content Management" 
                                href="/content-management"
                                collapsed={isCollapsedEffective} />
                        )}
                        
                        {isAdministrator && (
                            <SidebarLink icon={faTriangleExclamation} 
                                text="Report Management" 
                                href="/reports"
                                collapsed={isCollapsedEffective} />
                        )}
                    </div>

                    {/* Bottom Links */}
                    <div className = "flex flex-col gap-y-4">
                        <div className="h-px bg-[#576146] w-full" />
                        <SidebarLink icon={faGear} 
                            text="Settings" 
                            href="/settings"
                            onNavigate={() => setNavOpen(false)}
                            collapsed={isCollapsedEffective} />
                        <div className="h-px bg-[#576146] w-full" />
                        
                        {/* Top Loading Bar */}
                        {isLoggingOut && (
                            <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
                                <div 
                                    className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
                                    style={{ width: '30%' }}
                                />
                            </div>
                        )}
                        
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`cursor-pointer flex items-center hover:bg-white/20 p-2 rounded-xl text-left relative group ${
                                isLoggingOut ? 'opacity-60 cursor-wait' : ''
                            } ${isCollapsedEffective ? 'justify-center mx-2' : 'gap-x-6 mx-4'} mb-2`}
                        >
                            <FontAwesomeIcon
                                icon={faRightFromBracket}
                                className={`mt-1 text-[var(--background-color)] ${isLoggingOut ? 'animate-pulse' : ''}`}
                                style={{ width: "1.5rem", height: "1.5rem" }}
                            />
                            {!isCollapsedEffective && <span className="mt-1 text-sm">Log Out</span>}
                            {isCollapsedEffective && (
                                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-[var(--moldify-black)] text-[var(--background-color)] text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                                    Log Out
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>
            </div>
        </>
    );
}

// helper component for cleaner code
function SidebarLink({ icon, text, href, onNavigate, collapsed }: { icon: any; text: string; href: string; onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (pathname) {
      setActive(pathname === href || pathname.startsWith(href + "/"));
      setIsNavigating(false);
    }
  }, [pathname, href]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname !== href && !isNavigating) {
      setIsNavigating(true);
      router.push(href);
    }
  };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={`cursor-pointer flex hover:bg-white/20 p-2 rounded-xl items-center transition-all relative group ${
                active ? "bg-white/20" : ""
            } ${
                isNavigating ? "opacity-60" : ""
            } ${collapsed ? "justify-center mx-2" : "gap-x-6 mx-4"} mb-2`}
            title={collapsed ? text : undefined}
        >
      <FontAwesomeIcon
        icon={icon}
        className="mt-1 text-[var(--background-color)]"
        style={{ width: "1.5rem", height: "1.5rem" }}
      />
            {!collapsed && (
                <span className={`mt-1 text-sm ${active ? "font-bold" : ""}`}>
                    {text}
                </span>
            )}
                        {collapsed && (
                                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-[var(--moldify-black)] text-[var(--background-color)] text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                                        {text}
                                </span>
                        )}
    </Link>
  );
}
