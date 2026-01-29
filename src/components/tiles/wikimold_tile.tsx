"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link'; 

interface WikimoldTileProps {
  id: number | string; 
  image?: string;
  title: string;
  author: string;
}

export default function WikimoldTile({ id, image, title, author }: WikimoldTileProps) {
  const fallbackImage = "/assets/farm.jpg"; 
  const [imgSrc, setImgSrc] = useState<string>(image || fallbackImage);

  useEffect(() => {
    setImgSrc(image || fallbackImage);
  }, [image]);

  return (
    <Link href={`/wikimold/view-wikimold/${id}`} className="block w-full">
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="bg-[var(--taupe)] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col w-full border border-black/[0.03]"
      >
        <div className="relative w-full aspect-[21/9] overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 hover:scale-110"
            onError={() => setImgSrc(fallbackImage)}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="px-4 py-3 flex flex-col justify-center">
          <h3 className="text-[var(--primary-color)] font-black font-[family-name:var(--font-montserrat)] text-base md:text-md leading-tight line-clamp-1 tracking-tight">
            {title}
          </h3>
          <p className="text-[var(--moldify-black)] font-semibold font-[family-name:var(--font-bricolage-grotesque)] text-xs md:text-sm mt-0.5">
            By: {author}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}