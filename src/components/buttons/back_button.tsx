"use client";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface BackButtonProps {
  bgColor?: string;   // Optional: defaults to var(--taupe)
  iconColor?: string; // Optional: defaults to var(--primary-color)
}

export default function BackButton({ 
  bgColor = "var(--taupe)", 
  iconColor = "var(--primary-color)" 
}: BackButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      aria-label="Go back"
      type="button"
      onClick={() => router.back()}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      // We move the background color to the style object for dynamic injection
      style={{ backgroundColor: bgColor }}
      className="flex items-center justify-center rounded-full h-10 w-10 cursor-pointer shadow-sm relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-[var(--moldify-black)] opacity-0 group-hover:opacity-10 transition-opacity duration-500 ease-out" />
      
      <FontAwesomeIcon 
        icon={faArrowLeft} 
        style={{ color: iconColor }} 
      />
    </motion.button>
  );
}