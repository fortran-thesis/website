"use client";
import Link from 'next/link';
import Image from 'next/image';

const MoldifyLogo = '/assets/Moldify_Logo.png';
const grass = '/assets/grass.png';

export default function Footer() {
  return (
    <footer className="relative bg-[var(--primary-color)] px-6 lg:px-24 pt-16 pb-20 md:pb-12 w-full overflow-hidden">
      
      {/* --- CONTENT LAYER --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 relative z-30">
        
        {/* Left Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Image src={MoldifyLogo} alt="Moldify Logo" width={70} height={70} />
            <div className="flex flex-col">
              <h2 className="text-[var(--accent-color)] font-[family-name:var(--font-montserrat)] font-black text-4xl uppercase leading-none">MOLDIFY</h2>
              <p className="text-white text-md mt-1 font-[family-name:var(--font-bricolage-grotesque)]">A Mold Investigation System for Agriculture</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col sm:flex-row gap-12 md:gap-16 lg:gap-40 w-full md:w-auto">
          <div>
            <h3 className="text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-bold text-2xl mb-4">About</h3>
            <ul className="text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] text-md space-y-2">
              <li>
                <Link href="/about/about-us" className="relative w-fit block group transition-all duration-300">
                  About Us
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--background-color)] opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/about/contact-us" className="relative w-fit block group transition-all duration-300">
                  Contact Us
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--background-color)] opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-bold text-2xl mb-4">Support</h3>
            <ul className="text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] text-md space-y-2">
              <li>
                <Link href="/terms-of-agreement" className="relative w-fit block group transition-all duration-300">
                  Terms of Agreement
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--background-color)] opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="relative w-fit block group transition-all duration-300">
                  Privacy Policy
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--background-color)] opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/support/send-feedback" prefetch={false} className="relative w-fit block group transition-all duration-300">
                  Send Feedback
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--background-color)] opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/support/bug-report" prefetch={false} className="relative w-fit block group transition-all duration-300">
                  Bug Report
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--background-color)] opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- GRASS LAYER --- */}
      <div className="absolute inset-x-0 bottom-0 h-40 md:h-60 pointer-events-none z-10">
        
        {/* Left Grass */}
        <div className="absolute left-[-5%] bottom-[-80px] lg:bottom-[-60px] w-[120%] md:w-[100%] min-w-[300px]">
          <Image 
            src={grass} 
            alt="grass" 
            width={600} 
            height={300} 
            className="object-contain object-bottom scale-x-[-1] opacity-90" 
          />
        </div>

        {/* Right Grass */}
        <div className="absolute right-[-5%] bottom-[-120px] md:bottom-[-100px] w-[80%] md:w-[50%] min-w-[400px]">
          <Image 
            src={grass} 
            alt="grass2" 
            width={800} 
            height={400} 
            className="object-contain object-bottom opacity-100" 
          />
        </div>
      </div>

      {/* --- COPYRIGHT --- */}
      <div className="relative z-40 w-full flex justify-center mt-40 md:mt-20">
        <p className="text-sm text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] text-center">
          ©2026 <span className="font-bold font-[family-name:var(--font-montserrat)]">Moldify.</span> All rights reserved.
        </p>
      </div>

    </footer>
  );
}