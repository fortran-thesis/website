"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling } from "@fortawesome/free-solid-svg-icons"; // Use faLeaf or faSprout if available/preferred
import TopLoadingBar from "@/components/loading/top_loading_bar";

interface PageLoadingProps {
  message?: string;
  fullScreen?: boolean;
  compact?: boolean;
  showTopBar?: boolean;
}

export default function PageLoading({
  message = "Processing Crop Data...",
  fullScreen = false,
  compact = false,
  showTopBar = false,
}: PageLoadingProps) {
  
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <FontAwesomeIcon icon={faSeedling} className="text-[var(--accent-color)] text-[8px]" />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
          {message}
        </p>
      </div>
    );
  }

  return (
    <>
      <TopLoadingBar isVisible={showTopBar} />
      <div
        className={
          fullScreen
            ? "fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--background-color)]"
            : "w-full py-20 flex flex-col items-center justify-center"
        }
      >
        <div className="relative flex flex-col items-center">
          
          {/* Animated Thematic Icon: Plant Sprouting */}
          <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
             {/* The rotational guide rings for "Editorial" look */}
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[1px] border-[var(--primary-color)] opacity-5 rounded-full"
             />
             <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-[1px] border-[var(--accent-color)] rounded-full"
             />
             
             {/* Centered Sprout with "Growth" Animation */}
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [0.8, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
                className="text-4xl text-[var(--accent-color)]"
             >
                <FontAwesomeIcon icon={faSeedling} />
             </motion.div>
          </div>

          <div className="space-y-4 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-3xl font-black uppercase tracking-tighter leading-none"
            >
              {message}
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-5"
            >
              <div className="h-[1px] w-10 bg-[var(--primary-color)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
                Sync_In_Progress
              </p>
              <div className="h-[1px] w-10 bg-[var(--primary-color)]" />
            </motion.div>
          </div>
        </div>

        {/* Subtle Bottom Shimmer for FullScreen Editorial Look */}
        {fullScreen && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 overflow-hidden w-64 h-1 bg-[var(--taupe)] rounded-full border border-[var(--primary-color)]/5">
            <motion.div 
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50"
            />
          </div>
        )}
      </div>
    </>
  );
}