"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouseChimney, faBook, faFlag, faGear, faRightFromBracket, faBars } from '@fortawesome/free-solid-svg-icons';
import { usePathname } from 'next/navigation';

const MoldifyLogo = '/assets/Moldify_Logo.png';

// This is the sidebar component that contains navigation links to different 
// sections of the application.
// It is responsive and can be toggled on smaller screens.

export default function Sidebar() {
    const [navOpen, setNavOpen] = useState(false);
    return (
        <>
            <button 
                className = "sm:hidden fixed top-4 left-4 z-50"
                onClick={() => setNavOpen(true)}
                aria-label = "Open navigation"
                >
                <FontAwesomeIcon icon={faBars} className="cursor-pointer text-[var(--primary-color)]" style={{ width: "1.5rem", height: "1.5rem" }} />
            </button>

            {navOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 sm:hidden" onClick={() => setNavOpen(false)} />
            )}

            <div className={` bg-[var(--primary-color)] w-[280px] z-50 sm:sticky sm:top-0 sm:h-screen fixed top-0 left-0 h-full transform transition-transform duration-300 ${navOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 sm:static`}>
                <nav className="text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] flex flex-col h-full">
                    {/* Top Branding */}
                    <div className="flex flex-row items-start justify-center gap-4 p-6">
                        <Image 
                            src={MoldifyLogo} 
                            alt="Moldify Logo" 
                            width={60} 
                            height={60} 
                        />
                        <div className = "flex flex-col justify-center">
                            <h2 className="text-[var(--accent-color)] font-[family-name:var(--font-montserrat)] font-black text-3xl">MOLDIFY</h2>
                            <p className="text-[var(--background-color)] text-xs font-[family-name:var(--font-bricolage-grotesque)]">Identify mold with Moldify</p>
                        </div>
                    </div>

                    <div className="h-px bg-[#576146] w-full mb-2" />

                    {/* Navigation Container: fills vertical space */}
                    <div className="flex flex-col justify-between h-full mt-4">
                        {/* Top Links */}
                        <div className = "flex flex-col gap-y-4">
                            <SidebarLink icon={faHouseChimney} 
                                text="Dashboard" 
                                href="/home" />
                            <SidebarLink icon={faBook} 
                                text="Content Management" 
                                href="/content" />
                            <SidebarLink icon={faFlag} 
                                text="Flag Reports" 
                                href="/reports" />
                        </div>

                        {/* Bottom Links */}
                        <div className = "flex flex-col gap-y-4">
                            <div className="h-px bg-[#576146] w-full" />
                            <SidebarLink icon={faGear} 
                                text="Settings" 
                                href="/settings" />
                            <div className="h-px bg-[#576146] w-full" />
                            <SidebarLink icon={faRightFromBracket} 
                                text="Log Out" 
                                href="/logout" />
                        </div>
                    </div>
                </nav>
            </div>
        </>
    );
}

// helper component for cleaner code
function SidebarLink({ icon, text, href }: { icon: any; text: string, href: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <div
            className={`cursor-pointer flex gap-x-6 hover:bg-white/20 p-2 rounded-xl items-center mx-4 mb-2 ${
                isActive ? 'bg-white/20' : ''
            }`}
        >
            <FontAwesomeIcon
                icon={icon}
                className= {"mt-1 text-[var(--background-color)]"}
                style={{ width: "1.5rem", height: "1.5rem" }}
            />
            <Link
                href={href}
                className={`mt-1 text-sm ${isActive ? 'font-bold' : ''}`}
            >
                {text}
            </Link>
        </div>
    );
}
