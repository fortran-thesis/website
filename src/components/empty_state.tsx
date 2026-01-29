"use client";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface EmptyStateProps {
  icon: IconDefinition;
  title: string;
  message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center w-full"
    >
      <div className="bg-[var(--taupe)] w-20 h-20 rounded-full flex items-center justify-center mb-6">
        <FontAwesomeIcon icon={icon} className="text-[var(--primary-color)] text-3xl" />
      </div>
      <h3 className="text-[var(--moldify-black)] font-black font-[family-name:var(--font-montserrat)] text-xl md:text-2xl mb-2">
        {title}
      </h3>
      <p className="text-[var(--primary-color)] font-medium font-[family-name:var(--font-bricolage-grotesque)] text-sm md:text-base opacity-60 max-w-xs">
        {message}
      </p>
    </motion.div>
  );
}