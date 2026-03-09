"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface FAQTileProps {
  question: string;
  answer: string;
}

export default function FAQTile({ question, answer }: FAQTileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <motion.div
        animate={{ 
          backgroundColor: isOpen ? "#EBE7D5" : "#F3EFE0",
        }}
        className="rounded-xl overflow-hidden transition-colors duration-300"
      >
        {/* --- HEADER --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-5 md:p-6 flex items-center justify-between cursor-pointer focus:outline-none"
        >
          <span className="text-[var(--primary-color)] font-semibold font-[family-name:var(--font-bricolage-grotesque)] text-md text-left tracking-tight">
            {question}
          </span>

          {/* Simple Icon - No background, just rotation */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-[var(--accent-color)] ml-4"
          >
            <FontAwesomeIcon icon={faChevronDown} className="text-sm md:text-base" />
          </motion.div>
        </button>

        {/* --- CONTENT --- */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Added a bit more bottom padding to make the container feel "thick" and balanced */}
              <div className="px-6 pb-5 md:px-8 text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm leading-relaxed">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}