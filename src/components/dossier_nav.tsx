"use client";
import { useState, useEffect, useRef } from 'react';

interface NavItem {
  id: string;
  label: string;
}

export function StickyDossierNav({ items }: { items: NavItem[] }) {
  const [activeId, setActiveId] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { 
        root: null,
        rootMargin: '0px 0px -80% 0px',
        threshold: [0, 0.25, 0.5]
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsFixed(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div ref={navRef} className="relative">
        <nav className={`${isFixed ? 'fixed top-0 left-0 right-0' : 'relative'} z-[60] w-full bg-[var(--background-color)] backdrop-blur-xl border-y border-[var(--primary-color)]/10 transition-all`}>
          <div className="max-w-5xl mx-auto flex justify-center items-center gap-2 md:gap-8 py-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`px-4 py-3 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer border-b-2 ${
                  activeId === item.id
                    ? "text-[var(--primary-color)] border-[var(--accent-color)]"
                    : "text-[var(--primary-color)]/30 border-transparent hover:text-[var(--primary-color)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
      {isFixed && <div className="h-[48px]" />}
    </>
  );
}