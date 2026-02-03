"use client";
import { Navbar } from '../components/navbar';
import { TypeAnimation } from 'react-type-animation';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import Footer from '@/components/footer';
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownLong } from '@fortawesome/free-solid-svg-icons';
import { envOptions } from '@/configs/envOptions';

/// Pictures Used
const caseSub = '/assets/agr.png'; 
const knowledge = '/assets/knowledge.jpg';
const myco = '/assets/myco.jpg';
const leaf = '/assets/leaf.svg';
const downloadApp = '/assets/download_app.png';

const capabilities = [
  {
    title: "Case Submission",
    description: "Easily send in your crop mold problems or observations so we can take a closer look and help you solve them.",
    image: caseSub,
  },
  {
    title: "Expert Validation",
    description: "Have your results checked and explained by trained experts you can trust.",
    image: myco, 
  },
  {
    title: "Knowledge Support",
    description: "Find simple guides, tips, and trusted information to help your crops stay healthy and productive.",
    image: knowledge,
  },
];

const Counter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    // Animate whenever the value changes
    animate(count, value, { duration: 2.5, ease: "easeOut" });
  }, [value, count]);
  
  return (
    <motion.span>
      {rounded}
    </motion.span>
  );
};

export default function Home() {
  const [index, setIndex] = useState(0);
  const [totalCasesResolved, setTotalCasesResolved] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = envOptions.apiUrl.replace('/api/v1', '');
        const response = await fetch(`${baseUrl}/api/v1/mold-report/public/resolved-count`, { 
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('Resolved cases response:', data);
        
        // Extract the resolved count - handle different response formats
        let count = 0;
        if (typeof data === 'number') {
          count = data;
        } else if (data.success && data.data?.resolved_count !== undefined) {
          count = data.data.resolved_count;
        } else if (data.success && data.data?.resolvedCount !== undefined) {
          count = data.data.resolvedCount;
        } else if (data.data?.resolved_count !== undefined) {
          count = data.data.resolved_count;
        }
        
        if (count > 0) {
          setTotalCasesResolved(count);
          console.log('Set total resolved to:', count);
        }
      } catch (err) {
        console.error('Failed to fetch case statistics:', err);
      }
    };
    fetchStats();
  }, []);

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % capabilities.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-[var(--background-color)]">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <main className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative h-full w-full"
          >
            <img 
              src="/assets/rice-terraces.jpg" 
              alt="Rice Terraces"
              className="h-full w-full object-cover brightness-[1.05] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-black/40 z-10" />
          </motion.div>
        </div>

        {/* --- CONTENT --- */}
        <div className="relative z-20 w-full max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mb-4 text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase font-[family-name:var(--font-montserrat)] text-[var(--background-color)] drop-shadow-md">
              <TypeAnimation
                sequence={['Welcome to Moldify', 2500, 'Identify Crop Mold', 2500, 'Protect Your Harvest', 2500]}
                wrapper="span" speed={50} repeat={Infinity} cursor={true}
              />
            </h1>
            
            <p className="text-lg md:text-xl font-medium text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
            Don’t face crop mold alone. Moldify connects you with experts to keep your harvest safe.
            </p>
          </motion.div>
        </div>
      </main>

      {/* --- ABOUT SECTION --- */}
      <section className="relative min-h-screen w-full flex items-center justify-center px-6 md:px-12 lg:px-24 py-20 lg:py-0 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* 1. Top Leftish */}
          <motion.img 
            animate={{ y: [0, -15, 0], rotate: [-15, -10, -15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            src={leaf} 
            className="absolute top-[15%] left-[38%] w-0 lg:w-14 opacity-100 brightness-100" 
            alt="leaf" 
          />
          
          {/* 2. Bottom Left */}
          <motion.img 
            animate={{ y: [0, 20, 0], rotate: [10, 20, 10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            src={leaf} 
            className="absolute bottom-[5%] left-[18%] w-0 lg:w-16 opacity-100 brightness-100" 
            alt="leaf" 
          />

          {/* 3. Center Bottom */}
          <motion.img 
            animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src={leaf} 
            className="absolute bottom-[18%] left-[58%] w-0 lg:w-14 rotate-[-5deg] opacity-100 brightness-100" 
            alt="leaf" 
          />

          {/* 4. Middle Right */}
          <motion.img 
            animate={{ y: [0, -25, 0], rotate: [45, 35, 45] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            src={leaf} 
            className="absolute top-[38%] right-[7%] w-0 lg:w-16 opacity-100 brightness-100" 
            alt="leaf" 
          />

          {/* 5. Bottom Right */}
          <motion.img 
            animate={{ scale: [1, 1.1, 1], rotate: [20, 30, 20] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            src={leaf} 
            className="absolute bottom-[22%] right-[10%] w-0 lg:w-14 opacity-100 brightness-100" 
            alt="leaf" 
          />
        </div>

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-20">
          
          {/* Left Side: Images & Counter (Scroll Animation Added) */}
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-2 gap-10 items-start"
          >
            <div className="flex flex-col gap-10">
              <img 
                src="/assets/help-farmers.jpg"
                className="w-full aspect-[4/5] object-cover shadow-xl rounded-sm"
                alt="farmers"
              />
              
              <div className="flex flex-col">
                <div className="text-7xl font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] tracking-tighter leading-none">
                  <Counter value={totalCasesResolved} />
                </div>
                <p className="text-xl text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)]">
                  Total Cases Resolved
                </p>
              </div>
            </div>

            <div className="pt-32">
              <img 
                src="/assets/help-farmers-2.jpg"
                className="w-full aspect-square object-cover shadow-xl rounded-sm"
                alt="farmer working"
              />
            </div>
          </motion.div>

          {/* Right Side: Text (Scroll Animation Added) */}
          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col justify-center text-left"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[var(--primary-color)] leading-[0.9] uppercase tracking-tighter mb-6 font-[family-name:var(--font-montserrat)]">
              SUPPORTING <br /> FARMERS
            </h2>
            
            {/* Animated Accent Line */}
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "8rem" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-2 bg-[var(--accent-color)] mb-8 rounded-full" 
            />
            
            <p className="text-lg md:text-xl text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed">
              We help farmers identify and manage mold problems in their crops, keeping harvests safe and healthy. 
            </p>
          </motion.div>
        </div>
      </section>
    
      {/* --- CAPABILITIES SECTION --- */}
      <section className="relative w-full min-h-screen lg:h-screen bg-[var(--background-color)] flex items-center justify-center overflow-hidden px-6 md:px-12 lg:px-24 py-12 lg:py-0">      
          {/* 1. Top Leftish */}
          <motion.img 
            animate={{ y: [0, -15, 0], rotate: [-15, -10, -15] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            src={leaf} 
            className="absolute top-[15%] left-[38%] w-0 lg:w-14 opacity-100 brightness-100" 
            alt="leaf" 
          />
          
          {/* 2. Bottom Left */}
          <motion.img 
            animate={{ y: [0, 20, 0], rotate: [10, 20, 10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            src={leaf} 
            className="absolute bottom-[5%] left-[18%] w-0 lg:w-16 opacity-100 brightness-100" 
            alt="leaf" 
          />

          {/* 3. Center Bottom */}
          <motion.img 
            animate={{ x: [0, 10, 0], y: [0, -10, 0], rotate: [-60, -70, -60] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src={leaf} 
            className="absolute bottom-[18%] left-[55%] w-0 lg:w-14 rotate-[-5deg] opacity-100 brightness-100" 
            alt="leaf" 
          />
          {/* --- CIRCULAR MESH GRADIENTS (No hard lines) --- */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Top Left Circle */}
            <div 
              className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
              style={{ background: 'radial-gradient(circle, var(--accent-color) 0%, transparent 70%)' }}
            />
            {/* Bottom Right Circle */}
            <div 
              className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-15 blur-[140px]"
              style={{ background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 70%)' }}
            />
            {/* Center Accent Circle */}
            <div 
              className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]"
              style={{ background: 'radial-gradient(circle, var(--accent-color) 0%, transparent 70%)' }}
            />
          </div>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-center relative z-20">
            
            {/* --- LEFT SIDE: TEXT --- */}
            <div className="order-2 lg:order-1 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-sm uppercase tracking-[0.8em] text-[var(--primary-color)] font-black mb-6 font-[family-name:var(--font-montserrat)]">
                  Moldify Capabilities
                </h2>

                <div className="relative h-[220px] md:h-[260px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <h3 className="text-5xl md:text-6xl lg:text-7xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase leading-[0.85] mb-6 tracking-tighter">
                        {capabilities[index].title.split(' ')[0]} <br />
                        <span className="text-[var(--accent-color)]">
                          {capabilities[index].title.split(' ').slice(1).join(' ')}
                        </span>
                      </h3>
                      <p className="text-lg md:text-xl text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] max-w-md leading-relaxed">
                        {capabilities[index].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* --- CAROUSEL INDICATOR --- */}
                <div className="flex gap-6 mt-16">
                  {capabilities.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className="relative h-2 w-16 bg-[var(--moldify-softGrey)] rounded-full overflow-hidden transition-all duration-300"
                    >
                      {i === index && (
                        <motion.div 
                          layoutId="activeBarCircularSection"
                          className="absolute inset-0 bg-[var(--primary-color)]"
                          initial={{ x: "-100%" }}
                          animate={{ x: 0 }}
                          transition={{ duration: 5, ease: "linear" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* --- RIGHT SIDE: IMAGE --- */}
            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end items-center">
              <div className="relative w-full aspect-[4/5] max-w-[340px] lg:max-w-[420px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]"
                  >
                    <img 
                      src={capabilities[index].image} 
                      alt={capabilities[index].title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

      {/* --- VIDEO SECTION --- */}
     
      <section className="relative w-full min-h-screen lg:h-screen flex items-center justify-center bg-[var(--background-color)] overflow-hidden px-6 md:px-12 lg:px-24 py-0">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[var(--accent-color)] opacity-[0.05] blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative h-full flex items-center">
          
          <div className="relative w-full flex flex-col lg:block">
            
            {/* --- THE VIDEO --- */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full lg:w-[75%] z-10"
            >
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] bg-black border border-white/5">
                <iframe className="absolute inset-0 w-full h-full border-none" 
                src="https://www.youtube.com/embed/85kTHwJ1Ju8?si=t8WYOQP8h5lZu0Gs" 
                title="YouTube video player" 
                allowFullScreen>

                </iframe>
              </div>
            </motion.div>

            {/* --- THE TEXT CARD --- */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="
                relative z-20 mt-[-60px] mx-auto w-[94%] 
                lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:mt-0 lg:mx-0 lg:w-[440px] 
                
                /* Card Gradient Background */
                bg-gradient-to-br from-[var(--background-color)] via-[var(--background-color)] to-[var(--accent-color)]/5
                backdrop-blur-3xl 
                p-10 md:p-12 
                rounded-2xl
                shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] 
              "
            >
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl md:text-5xl font-black leading-[0.9] text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tighter">
                  HOW TO <br /> 
                  <span className="text-[var(--accent-color)]">
                    USE
                  </span> <br />
                  MOLDIFY
                </h2>
                
                {/* Accent Line with subtle glow */}
                <div className="w-16 h-1 bg-[var(--accent-color)] rounded-full shadow-[0_0_15px_var(--accent-color)]" />
                
                <p className="text-lg text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed">
                  Follow our quick tutorial and see how Moldify helps you protect your harvest, one case at a time.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative w-full min-h-screen lg:h-screen flex items-center justify-center overflow-hidden px-6 md:px-12 lg:px-24 py-20 lg:py-100">
  
        <div className="absolute inset-0 pointer-events-none z-30">
          <motion.img 
            animate={{ y: [0, -20, 0], rotate: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            src={leaf} 
            className="absolute top-[15%] left-[5%] w-0 lg:w-16 opacity-100 brightness-100" 
            alt="leaf" 
          />
          <motion.img 
            animate={{ y: [0, 15, 0], rotate: [5, -5, 5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            src={leaf} 
            className="absolute top-[10%] left-[28%] w-0 lg:w-14 opacity-100 brightness-100" 
            alt="leaf" 
          />
          <motion.img 
            animate={{ y: [0, -25, 0], rotate: [20, 40, 20] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            src={leaf} 
            className="absolute top-[35%] right-[45%] w-0 lg:w-14 opacity-100 brightness-100" 
            alt="leaf" 
          />
          <motion.img 
            animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            src={leaf} 
            className="absolute bottom-[20%] right-[60%] w-0 lg:w-16 opacity-100 brightness-100" 
            alt="leaf" 
          />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-20 w-full">
          
          {/* --- LEFT CONTENT --- */}
            <div className="flex flex-col text-left order-2 lg:order-1">
              <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-[var(--primary-color)] leading-[0.9] uppercase tracking-tighter mb-6 font-[family-name:var(--font-montserrat)]"
            >
              CROP <br /> PROBLEMS?
            </motion.h1>

            <div className="h-2 bg-[var(--accent-color)] w-32 mb-8 rounded-full" />

            <motion.p 
              className="text-lg md:text-xl text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed max-w-full lg:max-w-lg mb-10"
            >
              Worried about mold on your crops? Get expert help and simple guidance to protect your harvest and keep your plants healthy.
            </motion.p>

            {/* --- CTA BUTTON (Restored with external glow & shimmer) --- */}
            <div className="relative group w-fit">
              <motion.div 
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1.1, 1.3, 1.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 -z-10 rounded-full bg-[var(--accent-color)] blur-[40px] group-hover:opacity-60 group-hover:scale-[2.2] group-hover:blur-[60px] transition-all duration-1000 ease-out pointer-events-none" 
              />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center gap-4 bg-[var(--primary-color)] text-[var(--background-color)] px-10 py-5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-[var(--accent-color)]/10 to-[var(--accent-color)]/20" />

                {/* Constant Idle Shimmer */}
                <motion.div 
                  animate={{ left: ["-150%", "250%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                  className="absolute top-0 h-full w-1/3 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" 
                />
                
                <div className="relative z-10 flex items-center gap-4">
                  <FontAwesomeIcon icon={faDownLong} className="text-[var(--background-color)] text-xl" />                  
                  <div className="flex flex-col items-start leading-none">
                    <p className="text-xl font-black uppercase tracking-tight">download app</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* --- RIGHT CONTENT --- */}
            <div className="relative flex justify-center lg:justify-end items-center order-1 lg:order-2 lg:-mr-20 xl:-mr-32">
              <motion.img 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src={downloadApp} 
              className="relative z-10 w-full max-w-[450px] md:max-w-[550px] lg:max-w-[650px] h-auto object-contain drop-shadow-2xl" 
              alt="App Preview"
            />
          </div>
        </div>

        <style jsx global>{`
          @keyframes shimmer {
            0% { left: -150%; }
            100% { left: 150%; }
          }
        `}</style>
      </section>

      <Footer />
    </div>
  );
}