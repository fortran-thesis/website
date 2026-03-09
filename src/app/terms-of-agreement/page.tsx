// app/terms/page.tsx
"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import ScrollSpySidebar from '@/components/scrollspy_sidebar';
import Footer from '@/components/footer';
import BackButton from '@/components/buttons/back_button';

const leaf = '/assets/leaf.svg';

const TERMS_SECTIONS = [
  { id: 'section-1', label: 'General Terms', title: 'General Terms' },
  { id: 'section-2', label: 'Privacy Policy', title: 'Privacy Policy' },
  { id: 'section-3', label: 'User Conduct', title: 'User Conduct' },
  { id: 'section-4', label: 'Intellectual Property', title: 'Intellectual Property' },
  { id: 'section-5', label: 'Termination', title: 'Termination' },
];

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] overflow-x-clip">

      {/* --- FLOATING LEAVES ANIMATION --- */}
      <FloatingLeaf delay={0} top="2%" left="35%" rotate={45} />
      <FloatingLeaf delay={2} top="5%" left="10%" rotate={-20} />
      <FloatingLeaf delay={1} top="5%" right="15%" rotate={180} />

      {/* HEADER LOGO */}
      <header className="absolute top-8 left-8 z-20">
        <div className="flex items-center gap-3">
          <BackButton />
          <span className="tracking-widest font-bold font-[family-name:var(--font-montserrat)]">Go back</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-b from-[var(--background-color)] to-transparent">
        <h1 className="text-5xl md:text-7xl font-black font-[family-name:var(--font-montserrat)] uppercase tracking-tighter mb-6">
          Terms of Agreement
        </h1>
        <p className="max-w-3xl mx-auto font-semibold text-[var(--primary-color)] text-md md:text-lg leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
          incididunt ut labore et dolore magna aliqua.
        </p>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 pb-40 flex flex-col lg:flex-row items-start gap-12">        
        {/* REUSABLE SIDEBAR */}
        <ScrollSpySidebar items={TERMS_SECTIONS} />

        {/* CONTENT SECTIONS */}
        <div className="flex-1 space-y-24">
          {TERMS_SECTIONS.map((section) => (
            <article key={section.id} id={section.id} className="scroll-mt-32">
              <h2 className="text-2xl font-[family-name:var(--font-montserrat)] font-black mb-8 border-b-2 border-[#4a5d23]/10 pb-2">
                {section.title}
              </h2>
              <div className="space-y-6 text-[var(--moldify-black)] leading-8">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque cursus 
                  faucibus nibh vitae ornare. Donec ex enim, ultrices in efficitur a, 
                  congue vitae augue. Nulla laoreet euismod imperdiet. Nullam viverra 
                  neque neque, et tempus enim egestas ut. Quisque ullamcorper ex quis 
                  vulputate cursus.
                </p>
                <p>
                  Duis faucibus nisl quam, eget tempor lectus in porta nec, gravida a lacus. 
                  Duis sed vestibulum mi. Nunc suscipit nec nunc et vulputate. Curabitur 
                  vitae mauris feugiat, convallis arcu vel, consectetur nibh. Mauris 
                  dignissim vel dui placerat porttitor.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Vestibulum auctor ornare leo, non suscipit magna interdum eu.</li>
                  <li>Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet.</li>
                  <li>Pellentesque commodo lacus at sodales sodales.</li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      </main>
    <Footer />
    </div>
    
  );
}

// Sub-component for the animated leaves
function FloatingLeaf({ top, left, right, delay, rotate }: any) {
  return (
    <motion.div
      initial={{ y: 0, rotate: rotate }}
      animate={{ 
        y: [0, -20, 0],
        rotate: [rotate, rotate + 10, rotate - 5],
        x: [0, 5, 0]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
      className="absolute pointer-events-none z-10 opacity-100"
      style={{ top, left, right }}
    >
      <Image src={leaf} alt="" width={40} height={40} />
    </motion.div>
  );
}