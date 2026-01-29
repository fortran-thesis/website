"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Added this

const MoldifyLogo = '/assets/moldify-logo-v5.svg'; 

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'WikiMold', href: '/wikimold' },
  { name: 'FAQ', href: '/faq' },
];

const SCROLL_THRESHOLD = 50;

export function Navbar() {
  const pathname = usePathname(); // Get the current path automatically
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Logic Helpers ---
  const isActive = (href: string) => pathname === href;

  const baseClasses = `
    fixed top-0 left-0 w-full z-50 transition-all duration-500
    ${isScrolled ? 'bg-[var(--primary-color)] shadow-md' : 'bg-transparent'}
  `;

  const navItemClasses = (href: string) => `
    relative text-md font-semibold transition-colors duration-300
    text-[var(--background-color)] 
    font-[family-name:var(--font-bricolage-grotesque)]
    after:content-[''] after:absolute after:bottom-[-4px] after:left-0 
    after:w-full after:h-[2px] after:bg-[var(--background-color)] after:scale-x-0 
    after:transition-transform after:duration-300 after:origin-left
    hover:after:scale-x-100
    ${isActive(href) ? 'font-semibold after:scale-x-100' : ''}
  `;

  const logoClasses = `
    text-2xl transition-colors duration-500
    text-[var(--background-color)]
    font-[family-name:var(--font-montserrat)]
    font-black
  `;
    
  const hamburgerColorClass = 'bg-[var(--background-color)]';
    
  return (
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
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2" aria-label="Toggle menu">
            <div className="space-y-1.5">
              <span className={`block w-8 h-0.5 transition-all ${hamburgerColorClass} ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-8 h-0.5 transition-opacity ${hamburgerColorClass} ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-8 h-0.5 transition-all ${hamburgerColorClass} ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${isMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0'} bg-[var(--background-color)]`}>
        <div className="flex flex-col space-y-4 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg font-semibold font-[family-name:var(--font-bricolage-grotesque)] block py-2 px-3 rounded-md transition-colors text-[var(--primary-color)] ${isActive(item.href) ? 'font-bold bg-[var(--primary-color)]/5' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}