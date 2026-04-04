"use client";

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type CollapsibleEntryProps = {
  number: string;
  title: string;
  description?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  bodyWrapperClassName?: string;
  bodyClassName?: string;
  iconClassName?: string;
};

export function CollapsibleEntry({
  number,
  title,
  description,
  isExpanded,
  onToggle,
  children,
  className = '',
  titleClassName = '',
  bodyWrapperClassName = '',
  bodyClassName = '',
  iconClassName = '',
}: CollapsibleEntryProps) {
  return (
    <motion.div
      initial={false}
      className={`relative overflow-hidden transition-all duration-700 rounded-[2.5rem] border-2 ${
        isExpanded
          ? 'border-[var(--primary-color)]/20 bg-[var(--primary-color)]/[0.02]'
          : 'border-[var(--primary-color)]/5 bg-transparent hover:border-[var(--accent-color)]/20'
      } ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-8 md:p-10 flex items-center justify-between group relative z-10"
      >
        <div className="flex items-center gap-8">
          <span className={`font-[family-name:var(--font-montserrat)] font-black text-2xl md:text-4xl transition-colors ${isExpanded ? 'text-[var(--accent-color)]' : 'text-[var(--primary-color)]/20'}`}>
            {number}
          </span>

          <div className="flex flex-col">
            <h3 className={`text-xl md:text-2xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tighter ${titleClassName}`}>
              {title}
            </h3>
            {!isExpanded && description ? (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-black)]/40 mt-1">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className={`relative w-8 h-8 rounded-full border-2 border-[var(--primary-color)]/10 flex items-center justify-center transition-transform duration-500 ${isExpanded ? 'rotate-180 border-[var(--accent-color)]/40' : ''} ${iconClassName}`}>
          <div className={`w-3 h-0.5 bg-[var(--primary-color)] transition-colors ${isExpanded ? 'bg-[var(--accent-color)]' : ''}`} />
          <div className={`absolute w-3 h-0.5 bg-[var(--primary-color)] transition-all ${isExpanded ? 'bg-[var(--accent-color)] rotate-0 opacity-0' : 'rotate-90'}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className={`px-10 md:px-24 pb-12 pt-2 relative ${bodyWrapperClassName}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/[0.03] blur-[80px] rounded-full -z-10" />
              <div className={`border-l-2 border-[var(--accent-color)]/20 pl-8 ${bodyClassName}`}>
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
