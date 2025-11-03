"use client";
import Link from 'next/link';
import Image from 'next/image';
const MoldifyLogo = '/assets/Moldify_Logo.png';

{/* This is the footer of the Moldify Website
  It contains links to important pages such as About, Contact, Terms of Use, and Privacy Policy. */}
  
export default function Footer() {
  return (
    <footer className="bg-[var(--primary-color)] px-6 lg:px-20 pt-10 mt-4 w-full">
      {/* Top section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-0">
        {/* Logo & tagline */}
        <div className="flex flex-row items-start justify-center gap-4 p-6">
          <Image 
              src={MoldifyLogo} 
              alt="Moldify Logo" 
              width={60} 
              height={60} 
          />
          <div className = "flex flex-col justify-center">
              <h2 className="text-[var(--accent-color)] font-[family-name:var(--font-montserrat)] font-black text-3xl">MOLDIFY</h2>
              <p className="text-[var(--background-color)] text-xs font-[family-name:var(--font-bricolage-grotesque)]">Identify mold with Moldify</p>
          </div>
          </div>

        {/* About */}
        <div className = "pl-0 lg:pl-30">
          <h2 className="text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-2xl mb-2">About</h2>
          <ul className="space-y-1 text-[var(--background-color)] text-md font-light font-[family-name:var(--font-bricolage-grotesque)]">
            <li>
              <Link href="/about" className="hover:underline">About Us</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className = "pl-0 lg:pl-30">
          <h2 className="text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-2xl mb-2">Support</h2>
          <ul className="space-y-1 text-[var(--background-color)] text-md font-light font-[family-name:var(--font-bricolage-grotesque)]">
            <li>
              <Link href="/terms" className="hover:underline">Terms of Use</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/support/send-feedback" className="hover:underline">Send Feedback</Link>
            </li>
            <li>
              <Link href="/support/bug-report" className="hover:underline">Bug Report</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider and bottom text */}
      <div className="mt-10 border-t border-[var(--background-color)] py-4 flex items-center justify-center">
        <p className="text-sm text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)]">
          ©2026 <span className="text-[var(--accent-color)] font-black font-[family-name:var(--font-montserrat)]">Moldify.</span> All rights reserved.
        </p>
      </div>
    </footer>
  );
}
