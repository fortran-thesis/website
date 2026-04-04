"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouseChimney, faTriangleExclamation, faGear, faRightFromBracket, faBars, faUsers, faBookOpen, faSeedling, faChevronLeft, faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { usePathname, useRouter } from 'next/navigation';
import { useLogout } from '@/hooks/useLogout';
import ConfirmModal from '@/components/modals/confirmation_modal';
import TopLoadingBar from '@/components/loading/top_loading_bar';

const MoldifyLogo = '/assets/Moldify_Logo.png';

interface SidebarProps {
    userRole?: string;
}

export default function Sidebar({ userRole = "Administrator" }: SidebarProps) {
    const [navOpen, setNavOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true); 
    const [isDesktop, setIsDesktop] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const logout = useLogout();

    const normalizeRole = (role: string): string => {
        if (!role) return "Mycologist";
        const lowerRole = role.toLowerCase();
        return lowerRole === "admin" || lowerRole === "administrator" ? "Administrator" : "Mycologist";
    };

    const normalizedRole = normalizeRole(userRole);
    const isAdministrator = normalizedRole === "Administrator";
    const isMycologist = normalizedRole === "Mycologist";

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false);
        setIsLoggingOut(true);
        await logout();
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1280;
            setIsDesktop(desktop);
            if (!desktop) setIsCollapsed(false);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!isMounted || !isDesktop) return;
        const saved = window.localStorage.getItem("sidebarCollapsed");
        if (saved !== null) setIsCollapsed(saved === "true");
    }, [isDesktop, isMounted]);

    useEffect(() => {
        if (!isMounted || !isDesktop) return;
        window.localStorage.setItem("sidebarCollapsed", String(isCollapsed));
    }, [isCollapsed, isDesktop, isMounted]);

    const isCollapsedEffective = isMounted && isCollapsed && isDesktop;

    return (
        <>
            <TopLoadingBar isVisible={isLoggingOut} />

            {/* MOBILE TOP BAR */}
            <div className={`xl:hidden fixed top-0 left-0 w-full h-16 z-[60] flex items-center px-6 transition-all duration-300
                ${scrolled ? "bg-[var(--primary-color)] shadow-lg" : "bg-transparent"}
            `}>
                <button 
                    onClick={() => setNavOpen(true)} 
                    className="p-2 -ml-2"
                    aria-label="Open Menu"
                >
                    <FontAwesomeIcon 
                        icon={faBars} 
                        className={scrolled ? "text-white" : "text-[var(--primary-color)]"} 
                        style={{ width: "1.5rem", height: "1.5rem" }} 
                    />
                </button>
            </div>

            {/* MOBILE OVERLAY */}
            {navOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] xl:hidden transition-opacity duration-300" 
                    onClick={() => setNavOpen(false)} 
                />
            )}

            <div className="relative group/sidebar h-full">
                {/* FLOATING TOGGLE BUTTON - Centered Vertically & Hover-only */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`hidden xl:flex items-center justify-center fixed top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-[100] transition-all duration-300
                        bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 text-[var(--primary-color)]
                        opacity-0 group-hover/sidebar:opacity-100 hover:scale-110 cursor-pointer
                        ${isCollapsedEffective ? "left-[72px]" : "left-[264px]"}
                    `}
                >
                    <FontAwesomeIcon icon={isCollapsedEffective ? faChevronRight : faChevronLeft} size="sm" />
                </button>

                <aside
                    className={`fixed top-0 left-0 h-full z-[80] bg-[var(--primary-color)] transition-all duration-300 ease-in-out border-r border-white/10
                    ${navOpen ? "translate-x-0" : "-translate-x-full"} 
                    ${isCollapsedEffective ? "xl:w-[88px]" : "xl:w-[280px]"}
                    xl:translate-x-0 xl:sticky xl:top-0 xl:h-screen overflow-x-hidden
                    `}
                >
                    <nav className="text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] flex flex-col h-full">
                        
                        {/* Brand Section - Now cleaner without the button nearby */}
                        <div className={`flex items-start ${isCollapsedEffective ? "justify-center" : "justify-between gap-4"} p-6 pt-10 min-h-[120px]`}>
                            <div className="flex items-start gap-4">
                                <Image 
                                    src={MoldifyLogo} 
                                    alt="Logo" 
                                    width={isCollapsedEffective ? 45 : 60} 
                                    height={isCollapsedEffective ? 45 : 60} 
                                    className="flex-shrink-0"
                                />
                                {!isCollapsedEffective && (
                                    <div className="flex flex-col animate-in fade-in duration-300">
                                        <h2 className="text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-black text-2xl tracking-tight leading-none uppercase">MOLDIFY</h2>
                                        <p className="text-[10px] font-[family-name:var(--font-bricolage-grotesque)] opacity-70 mt-1 tracking-widest">Identify Mold with Moldify</p>
                                    </div>
                                )}
                            </div>
                            
                            <button onClick={() => setNavOpen(false)} className="xl:hidden text-white/50 hover:text-white">
                                <FontAwesomeIcon icon={faXmark} size="lg" />
                            </button>
                        </div>

                        <div className="h-px bg-white/10 mx-6 mb-6" />

                        {/* Navigation Links */}
                        <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar overflow-x-hidden">
                            <div className="px-3 space-y-2">
                                <SidebarLink icon={faHouseChimney} text="Dashboard" href="/dashboard" collapsed={isCollapsedEffective} onNavigate={() => setNavOpen(false)} />
                                {isAdministrator && <SidebarLink icon={faUsers} text="User Management" href="/user" collapsed={isCollapsedEffective} onNavigate={() => setNavOpen(false)} />}
                                <SidebarLink icon={faSeedling} text="Case Management" href="/investigation" collapsed={isCollapsedEffective} onNavigate={() => setNavOpen(false)} />
                                {isMycologist && <SidebarLink icon={faBookOpen} text="Content Management" href="/content-management" collapsed={isCollapsedEffective} onNavigate={() => setNavOpen(false)} />}
                                {isAdministrator && <SidebarLink icon={faTriangleExclamation} text="Report Management" href="/reports" collapsed={isCollapsedEffective} onNavigate={() => setNavOpen(false)} />}
                            </div>

                            <div className="px-3 pb-8 space-y-2">
                                <div className="h-px bg-white/10 mx-3 my-4" />
                                <SidebarLink icon={faGear} text="Settings" href="/settings" collapsed={isCollapsedEffective} onNavigate={() => setNavOpen(false)} />
                                
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    title={isCollapsedEffective ? "Log Out" : undefined}
                                    aria-label={isCollapsedEffective ? "Log Out" : undefined}
                                    className={`w-full flex items-center p-3 rounded-xl hover:bg-red-500/10 transition-all group relative
                                    ${isCollapsedEffective ? "justify-center" : "gap-5"}
                                    ${isLoggingOut ? "opacity-50" : ""}`}
                                >
                                    <div className="w-6 flex justify-center flex-shrink-0">
                                        <FontAwesomeIcon icon={faRightFromBracket} className={isLoggingOut ? "animate-pulse" : ""} />
                                    </div>
                                    {!isCollapsedEffective && <span className="text-sm font-medium">Log Out</span>}
                                    
                                    {isCollapsedEffective && (
                                        <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap z-[100] pointer-events-none shadow-xl transition-all duration-150 delay-300">
                                            Log Out
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </nav>
                </aside>
            </div>

            <ConfirmModal
                isOpen={showLogoutConfirm}
                title="Log Out"
                subtitle="Are you sure you want to log out?"
                cancelText="Cancel"
                confirmText="Log Out"
                confirmDisabled={isLoggingOut}
                confirmLoadingText="Logging out..."
                onCancel={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
            />
        </>
    );
}

function SidebarLink({ icon, text, href, collapsed, onNavigate }: { icon: any; text: string; href: string; collapsed: boolean; onNavigate?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const active = pathname === href || pathname.startsWith(href + "/");

    return (
        <Link
            href={href}
            title={collapsed ? text : undefined}
            aria-label={collapsed ? text : undefined}
            onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate();
                router.push(href);
            }}
            className={`flex items-center p-3 rounded-xl transition-all group relative
                ${active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}
                ${collapsed ? "justify-center" : "gap-5"}
            `}
        >
            <div className="w-6 flex justify-center flex-shrink-0">
                <FontAwesomeIcon icon={icon} style={{ width: "1.2rem", height: "1.2rem" }} />
            </div>
            
            {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {text}
                </span>
            )}

            {collapsed && (
                <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap z-[100] pointer-events-none shadow-xl transition-all duration-150 delay-300">
                    {text}
                </span>
            )}
        </Link>
    );
}