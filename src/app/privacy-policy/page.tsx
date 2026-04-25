"use client";
import type { ReactNode } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ScrollSpySidebar from '@/components/scrollspy_sidebar';
import Footer from '@/components/footer';
import BackButton from '@/components/buttons/back_button';

const leaf = '/assets/leaf.svg';

type PrivacySection = {
  id: string;
  label: string;
  title: string;
  content: ReactNode;
};

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: 'scope-of-this-policy',
    label: '1. Scope',
    title: '1. Scope of This Policy',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          This Privacy Policy applies to all users of the Moldify platform, covering both the mobile application and the web platform, including:
        </p>
        <ul className="space-y-5 font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)]">
          {[
            "Clients (farmers, horticulturists, students, and gardeners interacting with the system)",
            "Mycologists (BPI personnel conducting official mold investigations)",
            "Administrators (BPI personnel managing system cases and user accounts)"
          ].map((item, i) => (
            <li key={i} className="flex gap-5 items-start">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary-color)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'information-we-collect',
    label: '2. Data',
    title: '2. Information We Collect',
    content: (
      <div className="space-y-12">
        {[
          {
            clause: "2.1",
            title: "Account Registration Information",
            intro: "When you create an account on Moldify, we collect the following personal information:",
            items: [
              "First Name and Last Name",
              "Username",
              "Email Address",
              "Phone Number",
              "Occupation",
              "Location (City/Province)",
              "Password (stored in encrypted form)"
            ]
          },
          {
            clause: "2.2",
            title: "Mold Report Submission Information",
            intro: "When a Client submits a mold report, we collect the following:",
            items: [
              "Host plant affected",
              "Location of the affected plant",
              "Date the mold was first observed",
              "Photographs of the affected plant",
              "Problem description provided by the user"
            ]
          }
        ].map((item) => (
          <div key={item.clause} className="relative pl-10">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--primary-color)] opacity-20" />
            <div className="space-y-4">
              <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[11px] font-black uppercase tracking-[0.4em] text-[var(--primary-color)]">
                Section {item.clause}
              </span>
              <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-black uppercase tracking-tight text-[var(--primary-color)]">
                {item.title}
              </h3>
              <p className="max-w-4xl font-[family-name:var(--font-bricolage-grotesque)] text-[17px] leading-relaxed text-[var(--moldify-black)] opacity-90">
                {item.intro}
              </p>
              <ul className="space-y-5 font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)]">
                {item.items.map((line) => (
                  <li key={line} className="flex gap-5 items-start">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary-color)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'how-we-use-your-information',
    label: '3. Use',
    title: '3. How We Use Your Information',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          Moldify processes data exclusively for the delivery of mycological investigation and case management services:
        </p>
        <div className="grid grid-cols-1 gap-4">
          {[
            "Account management and user authentication",
            "Routing mold reports to assigned BPI mycologists",
            "Facilitating the Koch's Postulates laboratory workflow",
            "Generating AI-assisted genus classification supporting data",
            "Maintaining official BPI diagnostic case records"
          ].map((item, i) => (
            <div key={i} className="border-l-2 border-[var(--primary-color)]/10 pl-6 py-3">
              <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)]">
                {item}
              </p>
            </div>
          ))}
        </div>
        <p className="pt-6 font-[family-name:var(--font-montserrat)] text-[11px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]">
          No data is used for marketing or commercial third-party purposes.
        </p>
      </div>
    ),
  },
  {
    id: 'data-sharing-and-disclosure',
    label: '4. Sharing',
    title: '4. Data Sharing and Disclosure',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          Information is shared only with authorized BPI Personnel to facilitate investigation findings.
        </p>
        <div className="bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/10 p-8 rounded-sm space-y-4">
          <h4 className="font-[family-name:var(--font-montserrat)] text-[12px] font-black uppercase tracking-widest text-[var(--primary-color)]">
            Visibility Scope
          </h4>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)] leading-relaxed">
            Full names, contact details, and report specifics are shared with assigned mycologists to maintain official diagnostic procedures. Moldify does not sell or trade personal data to commercial entities.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'data-storage-and-security',
    label: '5. Security',
    title: '5. Data Storage and Security',
    content: (
      <div className="space-y-12">
        <div className="relative pl-10">
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--primary-color)] opacity-20" />
          <div className="space-y-4">
            <h3 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase tracking-tight text-[var(--primary-color)]">
              Infrastructure & Safety
            </h3>
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[17px] leading-relaxed text-[var(--moldify-black)] opacity-90">
              Data is stored using Firebase Firestore and Cloud Storage with role-based access controls. We implement 
              technical measures including encrypted password storage to prevent unauthorized disclosure.
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--primary-color)]/10 pt-10">
          <p className="font-[family-name:var(--font-montserrat)] text-[11px] font-black uppercase tracking-[0.4em] text-[var(--primary-color)] mb-6">
            Data Retention
          </p>
          <div className="space-y-6 font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)] leading-relaxed">
            <p>
              Records serve as official BPI diagnostic history and are retained for scientific research and subsequent 
              mycological studies.
            </p>
            <p className="italic border-l-2 border-[var(--primary-color)]/30 pl-6 opacity-70">
              Images and corrections are retained specifically to support the continuous improvement and retraining 
              of the Moldify AI classification model.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'your-rights-as-a-data-subject',
    label: '6. Rights',
    title: '6. Your Rights as a Data Subject',
    content: (
      <div className="space-y-10">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] text-[var(--moldify-black)]">
          Under Republic Act No. 10173, you hold the following rights:
        </p>
        <div className="grid grid-cols-1 gap-8">
          {[
            { r: "Right to be Informed", d: "Awareness of how data is collected and processed." },
            { r: "Right to Access & Rectification", d: "Ability to request data copies or update info via Settings." },
            { r: "Right to Erasure", d: "Account deletion requests are handled manually as records form part of BPI's official diagnostic history." },
            { r: "Right to Portability", d: "Requesting data in a structured, commonly used format." }
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <span className="font-[family-name:var(--font-montserrat)] text-[12px] font-black text-[var(--primary-color)] pt-1">
                {i + 1}
              </span>
              <div className="space-y-1">
                <p className="font-[family-name:var(--font-montserrat)] text-sm font-black uppercase tracking-wider text-[var(--primary-color)]">
                  {item.r}
                </p>
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[15px] text-[var(--moldify-black)] opacity-70">
                  {item.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'cookies-and-tracking',
    label: '7. Cookies',
    title: '7. Cookies and Tracking',
    content: (
      <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[17px] leading-relaxed text-[var(--moldify-black)]">
        The Moldify web platform uses session-based cookies strictly for authentication. The mobile application 
        does not utilize tracking cookies for advertising or cross-site monitoring.
      </p>
    ),
  },
  {
    id: 'changes-to-this-privacy-policy',
    label: '8. Changes',
    title: '8. Changes to This Privacy Policy',
    content: (
      <div className="space-y-6">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[17px] leading-relaxed text-[var(--moldify-black)]">
          We reserve the right to modify this policy at any time. Updates will be reflected via the Effective Date.
        </p>
        <p className="font-[family-name:var(--font-montserrat)] text-[11px] font-black uppercase tracking-[0.25em] text-[var(--primary-color)] opacity-60 italic">
          Continued use constitutes acceptance of revised privacy terms.
        </p>
      </div>
    ),
  },
  {
    id: 'contact-information',
    label: '9. Contact',
    title: '9. Contact Information',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] text-[var(--moldify-black)]">
          For concerns regarding data privacy or handling:
        </p>
        <div className="space-y-4 border-l-2 border-[var(--primary-color)]/20 pl-8 py-2">
          <h3 className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] font-black uppercase tracking-tight text-[var(--primary-color)]">
            Bureau of Plant Industry (BPI)
          </h3>
          <div className="space-y-1 font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)]">
            <p>692 San Andres Street, Malate, Manila 1004, Philippines</p>
            <p>
              <span className="font-bold text-[var(--primary-color)] uppercase text-[11px] tracking-widest mr-2">Online:</span>
              <a className="font-bold underline underline-offset-4 decoration-[var(--primary-color)]/30" href="https://www.bpi.da.gov.ph" target="_blank" rel="noreferrer">
                www.bpi.da.gov.ph
              </a>
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
      <div className="relative min-h-screen bg-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] overflow-x-clip">

      {/* --- FLOATING LEAVES ANIMATION --- */}
      <FloatingLeaf delay={0} top="1%" left="35%" rotate={45} />
      <FloatingLeaf delay={2} top="3%" left="10%" rotate={-20} />
      <FloatingLeaf delay={1} top="3%" right="15%" rotate={180} />

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
          Privacy Policy
        </h1>
        <p className="max-w-3xl mx-auto font-medium text-[var(--primary-color)] text-md md:text-lg leading-relaxed">
          This Privacy Policy explains how Moldify collects, uses, stores, and protects personal data when you use the
          Moldify mobile application and web platform.
        </p>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 pb-40 flex flex-col lg:flex-row items-start gap-12">        
        {/* REUSABLE SIDEBAR */}
        <ScrollSpySidebar items={PRIVACY_SECTIONS} />

        {/* CONTENT SECTIONS */}
        <div className="flex-1 space-y-24">
          {PRIVACY_SECTIONS.map((section) => (
            <article key={section.id} id={section.id} className="scroll-mt-32">
              <h2 className="text-2xl font-[family-name:var(--font-montserrat)] font-black mb-8 border-b-2 border-[#4a5d23]/10 pb-2">
                {section.title}
              </h2>
              <div className="space-y-6 text-[var(--moldify-black)] leading-8">
                {section.content}
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
