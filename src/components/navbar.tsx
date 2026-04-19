"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const MoldifyLogo = '/assets/moldify-logo-v5.svg'; 

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'WikiMold', href: '/wikimold' },
  { name: 'FAQ', href: '/faq' },
];

const SCROLL_THRESHOLD = 50;

export function Navbar() {
  const pathname = usePathname(); // Get the current path automatically
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Logic Helpers ---
  const isActive = (href: string) => pathname === href;
  const isNavigating = (href: string) => navigatingTo === href;

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (pathname !== href && !navigatingTo) {
      setNavigatingTo(href);
      setIsMenuOpen(false);
      router.push(href);
    }
  };

  const baseClasses = `
    fixed top-0 left-0 w-full z-50 transition-all duration-500
    ${isScrolled || isMenuOpen ? 'bg-[var(--primary-color)] shadow-md' : 'bg-transparent'}
  `;

  const navItemClasses = (href: string) => `
    relative text-md font-semibold transition-all duration-300
    text-[var(--background-color)] 
    font-[family-name:var(--font-bricolage-grotesque)]
    after:content-[''] after:absolute after:bottom-[-4px] after:left-0 
    after:w-full after:h-[2px] after:bg-[var(--background-color)] after:scale-x-0 
    after:transition-transform after:duration-300 after:origin-left
    hover:after:scale-x-100
    ${isActive(href) ? 'font-semibold after:scale-x-100' : ''}
    ${isNavigating(href) ? 'opacity-60' : ''}
  `;

  const logoClasses = `
    text-2xl transition-colors duration-500
    text-[var(--background-color)]
    font-[family-name:var(--font-montserrat)]
    font-black
  `;
    
  const hamburgerColorClass = 'bg-[var(--background-color)]';
    
  return (
    <>
      {/* Top Loading Bar */}
      {navigatingTo && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
               style={{ width: '30%' }} />
        </div>
      )}
      
      <nav className={baseClasses}>
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo and App Name */}
          <Link 
            href="/" 
            className="flex items-center space-x-6 cursor-pointer"
            aria-label="Moldify Home"
          >
            <Image
              src={MoldifyLogo}
              alt=""
              width={32} 
              height={32}
              className="w-12 h-12 object-contain transition-all duration-500" 
            />
            <span className={logoClasses}>MOLDIFY</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={navItemClasses(item.href)}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          
          <button
            className="bg-[var(--background-color)] text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]
              text-lg font-semibold py-1 px-8 rounded-md ml-4 cursor-pointer transition-all duration-300 ease-in-out border border-transparent
              hover:bg-white hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(180,211,127,0.6)] hover:border-[var(--moldify-light-green)]/30"
            onClick={() => (window.location.href = "/auth/log-in")}
            >
            Log In
          </button>
        </div>

        {/* Mobile Toggle */}
       <div className="md:hidden flex items-center">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-2 relative z-[70] cursor-pointer outline-none" 
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className={`block w-8 h-0.5 transition-all duration-300 ${hamburgerColorClass} ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-8 h-0.5 transition-all duration-300 ${hamburgerColorClass} ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-8 h-0.5 transition-all duration-300 ${hamburgerColorClass} ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Standard Mobile Dropdown with Consistent Background */}
        <div 
          className={`md:hidden absolute top-full left-0 w-full z-[60] overflow-hidden transition-all duration-500 ease-in-out bg-[var(--background-color)] border-t border-[var(--primary-color)]/5 shadow-2xl ${
            isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col px-8 pt-8 pb-10 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  handleNavClick(e, item.href);
                  setIsMenuOpen(false);
                }}
                className={`relative py-4 transition-all duration-300 font-[family-name:var(--font-montserrat)] text-sm font-black uppercase tracking-[0.2em] ${
                  isActive(item.href) 
                    ? 'text-[var(--primary-color)]' 
                    : 'text-[var(--primary-color)]/40 hover:text-[var(--primary-color)]'
                } ${isNavigating(item.href) ? 'opacity-50' : ''}`}
              >
                <span className="relative z-10">{item.name}</span>
                
                {/* Minimalist Underline Indicator */}
                {isActive(item.href) && (
                  <span className="absolute bottom-3 left-0 w-6 h-1 bg-[var(--accent-color)] rounded-full" />
                )}
              </Link>
            ))}

            <div className="pt-8 mt-4 border-t border-[var(--primary-color)]/5">
              <Link
                href="/auth/log-in"
                onClick={(e) => {
                  handleNavClick(e, '/auth/log-in');
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center w-full py-5 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.25em] font-[family-name:var(--font-montserrat)] bg-[var(--primary-color)] text-[var(--background-color)] shadow-xl shadow-[var(--primary-color)]/20 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Log In
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </nav>
    </>
  );
}