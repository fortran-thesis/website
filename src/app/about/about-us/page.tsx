"use client";
import { motion } from 'framer-motion';
import Footer from '@/components/footer';
import BackButton from '@/components/buttons/back_button';

export default function AboutUs() {
  const headerBg = '/assets/mold-fruit-1.jpg';

  const teamMembers = [
    { name: "Faith Gabrielle A. Gamboa", role: "Designer", image: "/assets/faith.png" },
    { name: "Karl Manuel M. Diata", role: "Project Manager", image: "/assets/karl.png" },
    { name: "Richmond Glenn M. Viloria", role: "Programmer", image: "/assets/richmond.png" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="relative w-full bg-[#FCF9F1] overflow-x-hidden"
    >
      {/* --- HEADER --- */}
      <header className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${headerBg})` }}
        >
          <div className="absolute inset-0 bg-black/45 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
        </div>

        <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center gap-3 cursor-pointer group">
            <BackButton bgColor="transparent" iconColor="var(--background-color)" />
            <span className="tracking-widest font-bold font-[family-name:var(--font-montserrat)] text-[var(--background-color)] text-sm group-hover:translate-x-1 transition-transform">
              Go back
            </span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-4xl px-6 text-center text-[var(--background-color)]">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-[family-name:var(--font-montserrat)] uppercase tracking-tighter mb-4">
            About Us
          </h1>
          <p className="text-sm md:text-base font-[family-name:var(--font-bricolage-grotesque)] max-w-xl mx-auto mb-10 leading-relaxed opacity-90">          
            Learn more about our story, and the dedicated team behind our mold investigation system.
          </p>          
        </div>
      </header>

      <main className="w-full">
        {/* SECTION: OUR STORY - Fixed Responsiveness */}
        <section className="py-20 md:py-32 px-6 md:px-12 lg:px-32 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Title side - Fixed 'sticky' behavior for mobile */}
            <div className="lg:col-span-5 lg:sticky lg:top-10">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tighter leading-[0.85]">
                Our <br />
                <span className="text-[var(--accent-color)]">Story</span>
              </h2>
              <div className="h-2 bg-[var(--primary-color)] w-20 md:w-24 mt-6 md:mt-8" />
            </div>

            {/* Content side */}
            <div className="lg:col-span-7 space-y-8 md:space-y-12">
              <p className="text-xl md:text-2xl lg:text-3xl text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] font-bold leading-tight">
                "We are bridging the gap between fungal research and digital intelligence."
              </p>
              <div className="space-y-6 md:space-y-8 text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-base md:text-lg lg:text-xl leading-relaxed border-l-2 border-black/5 pl-6 md:pl-12 text-justify md:text-left">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris.
                </p>
                <p>
                  Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-[var(--primary-color)]/[0.02] py-16 md:py-20 border-y border-black/5">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-8">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <h2 className="text-4xl md:text-5xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tighter leading-none">
                The <br /> Core Team
              </h2>
              <p className="max-w-[300px] text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-left md:text-right text-sm leading-snug">
                The developers behind the application, committed to building efficient tools for agricultural mold identification.
              </p>
            </div>

            {/* Constrained the grid to max-w-4xl (approx 900px) so pictures are smaller on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group w-full"
                >
                  {/* Photo: Added a slightly more aggressive scale-down via container padding or margins */}
                  <div className="relative overflow-hidden aspect-square rounded-2xl bg-white shadow-md transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-color)]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="mt-6 flex items-center flex-col text-center">
                    <h3 className="text-base md:text-lg font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase leading-tight tracking-tighter">
                      {member.name}
                    </h3>
                    <p className="text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-sm md:text-base mt-1">
                      {member.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </motion.div>
  );
}