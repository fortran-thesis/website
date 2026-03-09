"use client";
import { useEffect, useState } from 'react';

interface ScrollSpySidebarItem {
  id: string;
  label: string;
}

interface ScrollSpySidebarProps {
  items: ScrollSpySidebarItem[];
  activeColor?: string;
}

export default function ScrollSpySidebar({ items, activeColor = "#4a5d23" }: ScrollSpySidebarProps) {
  // Initialize with the first item's ID so it's active immediately
  const [activeId, setActiveId] = useState(items[0]?.id || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      // rootMargin: -10% from top means it activates when the section hits near the top
      { rootMargin: '-10% 0px -70% 0px', threshold: 0.1 } 
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; 
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (

    <nav className="sticky top-32 self-start hidden lg:block w-64 pr-8 z-20">
      <ul className="space-y-4 border-l-2 border-gray-200/50">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={`cursor-pointer block w-full text-left pl-6 py-1 text-sm font-[family-name:var(--font-montserrat)] transition-all duration-300 border-l-4 ml-1 uppercase tracking-tight ${
                activeId === item.id
                  ? 'text-[var(--primary-color)] border-[var(--accent-color)] scale-105 font-black'
                  : 'border-transparent hover:font-black hover:scale-105 '
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}