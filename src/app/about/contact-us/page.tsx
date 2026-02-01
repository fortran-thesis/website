"use client";
import { motion } from 'framer-motion';
import Footer from '@/components/footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import BackButton from '@/components/buttons/back_button';

export default function ContactUs() {
  const headerBg = '/assets/farm-mindoro.jpg';
  const farmerImg = '/assets/farmer.jpg';
  const leafSvg = '/assets/leaf.svg';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="relative w-full bg-[#FCF9F1] overflow-x-hidden"
    >
      {/* --- HEADER --- */}
      <header className="relative h-[60vh] min-min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${headerBg})` }}
        >
          <div className="absolute inset-0 bg-black/45 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
        </div>

        <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center gap-3 cursor-pointer group">
            <BackButton bgColor="transparent" iconColor="var(--background-color)" />
            <span className="tracking-widest font-bold font-[family-name:var(--font-montserrat)] text-[var(--background-color)] text-sm">
              Go back
            </span>
          </div>
        </div>

        {/* Header Content - Exactly matching your WikiMold format */}
        <div className="relative z-10 w-full max-w-4xl px-6 text-center text-[var(--background-color)]">
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-black font-[family-name:var(--font-montserrat)] uppercase tracking-tighter mb-4"
          >
            Contact Us
          </h1>
          
          <p 
            className="text-sm md:text-base font-[family-name:var(--font-bricolage-grotesque)] max-w-xl mx-auto mb-10 leading-relaxed opacity-90"
          >          
            Reach out to us for any inquiries regarding agricultural mold detection. We're here to help you cultivate a healthier future for agriculture.
          </p>
                    
        </div>
      </header>


      {/* --- MAIN SECTION --- */}
      <main className="w-full py-20 px-6 md:px-12 lg:px-32">    
        <section className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-center mb-20 gap-10">
            {/* Left Side: Text */}
            <div className="flex-1 space-y-5">
              <h2 className="text-3xl md:text-4xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] tracking-tight">
                Contact Information
              </h2>
              <p className="text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-lg leading-relaxed max-w-2xl">
                Reach out to us through any of these platforms. Our team is dedicated to providing agricultural assistance and fungal research support.
              </p>
              
              {/* SOCIALS CONTAINER: Now forced to stay on one line on desktop */}
              <div className="flex flex-row flex-wrap lg:flex-nowrap items-center gap-y-8 gap-x-8 xl:gap-x-12 pt-4">
                
                {/* Phone Link */}
                <a 
                  href="tel:282489130" 
                  className="flex items-center gap-3 group cursor-pointer whitespace-nowrap"
                >
                  <div className="h-11 w-11 shrink-0 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faPhone} className="text-sm" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-sm tracking-wider">Contact Number</p>
                    <p className="text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm group-hover:underline decoration-2 underline-offset-4">
                    282489130
                    </p>
                  </div>
                </a>

                {/* Email Link */}
                <a 
                  href="mailto:info@buplant.da.gov.ph" 
                  className="flex items-center gap-3 group cursor-pointer whitespace-nowrap"
                >
                  <div className="h-11 w-11 shrink-0 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-sm tracking-wider">Email</p>
                    <p className="text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm group-hover:underline decoration-2 underline-offset-4">
                      info@buplant.da.gov.ph
                    </p>
                  </div>
                </a>

                {/* Facebook Link */}
                <a 
                  href="https://www.facebook.com/BureauOfPlantIndustry" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 group cursor-pointer whitespace-nowrap"
                >
                  <div className="h-11 w-11 shrink-0 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faFacebookF as IconProp} className="text-sm" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-sm tracking-wider">Facebook</p>
                    <p className="text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-sm group-hover:underline decoration-2 underline-offset-4">
                      Bureau of Plant Industry
                    </p>
                  </div>
                </a>

              </div>
            </div>

            {/* Right Side Image */}
            <div className="lg:w-[320px] w-full shrink-0">
              <div className="rounded-[40px] overflow-hidden shadow-lg border-none">
                <img src={farmerImg} alt="Farmers" className="w-full h-[320px] object-cover" />
              </div>
            </div>
          </section>

          <section className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center relative mb-8 sm:mb-12 md:mb-16 lg:mb-22 px-6 md:px-12 lg:px-0">            {/* FLOATING LEAVES: Adjusted positioning to stay relative to the section area */}
            <motion.img 
              animate={{ y: [0, -20, 0], rotate: [-15, 15, -15] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              src={leafSvg} 
              className="absolute top-[-5%] left-[55%] w-0 xl:w-14 z-30 hidden lg:block" 
              alt="leaf" 
            />
            <motion.img 
              animate={{ y: [0, 20, 0], rotate: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              src={leafSvg} 
              className="absolute bottom-[10%] left-[55%] w-0 xl:w-10 z-30 hidden lg:block" 
              alt="leaf" 
            />
            <motion.img 
              animate={{ y: [0, -15, 0], rotate: [5, -5, 5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              src={leafSvg} 
              className="absolute top-[30%] right-[-2%] w-0 xl:w-16 z-30 hidden lg:block" 
              alt="leaf" 
            />

            
            <div className="w-full rounded-3xl overflow-hidden shadow-xl h-[500px] z-10">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.5088261201468!2d120.98540059678955!3d14.570057699999992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9804bae8389%3A0x1bcf7afc880afe47!2sBureau%20Of%20Plant%20Industry!5e0!3m2!1sen!2sph!4v1769673776437!5m2!1sen!2sph" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
              />
            </div>

            {/* Text Section: Centered on mobile, Left-aligned on Desktop */}
            <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[var(--primary-color)] leading-[0.9] uppercase tracking-tighter mb-6 font-[family-name:var(--font-montserrat)]">
                WHERE TO <br className="hidden lg:block" /> FIND US
              </h2>
              
              <div className="h-2 bg-[var(--accent-color)] w-32 mb-8 rounded-full" />
              
              <p className="text-lg md:text-xl text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed max-w-xl mb-10">
                For professional consultation and urgent crop assistance, visit the Bureau of Plant Industry at 
                <span className="font-bold text-[var(--primary-color)] text-xl md:text-2xl mt-2 block">
                  692 San Andres St, Malate, Manila.
                </span>
              </p>
            </div>
          </section>
        </main>
      <Footer />
    </motion.div>
  );
}