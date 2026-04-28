"use client";
import type { ReactNode } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ScrollSpySidebar from '@/components/scrollspy_sidebar';
import Footer from '@/components/footer';
import BackButton from '@/components/buttons/back_button';

const leaf = '/assets/leaf.svg';

type TermsSection = {
  id: string;
  label: string;
  title: string;
  content: ReactNode;
};

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'acceptance-of-terms',
    label: '1. Acceptance',
    title: '1. Acceptance of Terms',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          By creating a Moldify account and using the platform, you confirm that:
        </p>
        <ul className="space-y-5 font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)]">
          {[
            "You are at least 18 years of age, or are using the platform under the supervision of a parent or legal guardian",
            "You have read, understood, and agree to these Terms and the Moldify Privacy Policy",
            "The information you provide during registration and use of the platform is accurate and complete"
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
    id: 'description-of-service',
    label: '2. Service',
    title: '2. Description of Service',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          Moldify is an AI-assisted mold investigation and case management system designed to facilitate the submission
          of mold-related crop concerns by clients and the conduct of official mold investigations by BPI mycologists. 
          The platform provides the following core services:
        </p>
        <div className="grid grid-cols-1 gap-6">
          {[
            { label: "Client Module", text: "Submission of mold reports, case status tracking, access to WikiMold reference database, and access to FAQ and educational resources." },
            { label: "Mycologist Module", text: "Investigation workflow management based on Koch's Postulates (in vitro and in vivo), mold classification using Convolutional Neural Networks (CNN) and Artificial Neural Networks (ANN), and findings documentation." },
            { label: "Administrator Module", text: "Case assignment, user management, and administrative oversight." },
            { label: "WikiMold", text: "A reference database of mold information authored and validated by BPI mycologists." }
          ].map((item, i) => (
            <div key={i} className="border-l-2 border-[var(--primary-color)]/30 pl-8 py-2">
              <p className="font-[family-name:var(--font-montserrat)] text-[12px] font-black uppercase tracking-[0.25em] text-[var(--primary-color)] mb-2">
                {item.label}
              </p>
              <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] leading-relaxed text-[var(--moldify-black)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'user-accounts-and-registration',
    label: '3. Accounts',
    title: '3. User Accounts and Registration',
    content: (
      <div className="space-y-12">
        {[
          {
            clause: "3.1",
            title: "Account Accuracy",
            text: "You are responsible for providing accurate, current, and complete information during registration and for keeping your account information updated. You may update your profile information through the Settings section of the application."
          },
          {
            clause: "3.2",
            title: "Account Security",
            text: "You are responsible for maintaining the confidentiality of your account credentials, including your password. You agree to notify Moldify immediately if you suspect any unauthorized access to or use of your account. Moldify and BPI shall not be liable for any loss or damage arising from your failure to safeguard your account credentials."
          },
          {
            clause: "3.3",
            title: "Account Access",
            text: "Moldify accounts are personal and non-transferable. You may not share your account with or transfer your account to any other person."
          }
        ].map((item) => (
          <div key={item.clause} className="relative pl-10">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--primary-color)] opacity-20" />
            <div className="space-y-4">
              <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[11px] font-black uppercase tracking-[0.4em] text-[var(--primary-color)]">
                Clause {item.clause}
              </span>
              <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-black uppercase tracking-tight text-[var(--primary-color)]">
                {item.title}
              </h3>
              <p className="max-w-4xl font-[family-name:var(--font-bricolage-grotesque)] text-[17px] leading-relaxed text-[var(--moldify-black)]">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'acceptable-use',
    label: '4. Use',
    title: '4. Acceptable Use',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          You agree to use Moldify only for its intended purposes as described in Section 2. You agree not to:
        </p>
        <ul className="space-y-5 font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)]">
          {[
            "Submit false, misleading, or fabricated mold reports or information",
            "Upload photographs or content that are irrelevant, offensive, or in violation of applicable Philippine law",
            "Attempt to gain unauthorized access to any part of the Moldify system, including accounts belonging to other users",
            "Interfere with or disrupt the technical operation of the Moldify platform",
            "Use Moldify for any commercial purpose not authorized by BPI",
            "Attempt to reverse engineer, decompile, or extract source code from the Moldify application"
          ].map((item, i) => (
            <li key={i} className="flex gap-5 items-start">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary-color)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="pt-8 border-t border-[var(--primary-color)]/10 font-[family-name:var(--font-montserrat)] text-[11px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)] opacity-90">
          Moldify and BPI reserve the right to suspend or terminate accounts that violate these Terms.
        </p>
      </div>
    ),
  },
  {
    id: 'ai-limitations',
    label: '5. AI Limits',
    title: '5. AI-Assisted Classification — Limitations and Disclaimer',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          Moldify incorporates an AI-powered image classification system designed to support mold genus identification. 
          By using this feature, you acknowledge and agree to the following:
        </p>
        <div className="space-y-6">
          {[
            "AI classification results are provided as decision-support tools only. They are not a substitute for professional mycological assessment.",
            "All AI-generated classification outputs must be reviewed and validated by a qualified BPI mycologist before any findings are considered official.",
            "Moldify does not guarantee the accuracy of AI classification results. Classification is limited to six mold genera: Alternaria, Aspergillus flavus, Aspergillus niger, Fusarium, Penicillium, and Rhizopus.",
            "Moldify shall not be held liable for any decisions made solely on the basis of AI classification outputs without professional mycologist validation."
          ].map((item, i) => (
            <div key={i} className="border-l-4 border-[var(--primary-color)]/20 pl-8 py-3 italic">
              <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] leading-relaxed text-[var(--moldify-black)]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'workflow',
    label: '6. Workflow',
    title: '6. Mold Reports and Investigation Workflow',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          When you submit a mold report through Moldify:
        </p>
        <div className="space-y-6">
          {[
            "Your report will be reviewed by a BPI administrator and assigned to an appropriate BPI mycologist for investigation.",
            "The investigation process follows Koch's Postulates methodology and involves laboratory procedures that require a minimum biological incubation period. The duration of a mold investigation is determined by biological constraints and cannot be shortened by the platform.",
            "Moldify serves as a workflow facilitation tool. The completeness and accuracy of investigation findings depend on the quality of information and samples provided.",
            "Findings and recommendations delivered through Moldify are issued by BPI mycologists and reflect professional judgment. For financial assistance or further on-site support, you are encouraged to contact your Municipal or City Agriculture Office (MAO/CAO) or the Philippine Crop Insurance Corporation (PCIC)."
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <span className="font-[family-name:var(--font-montserrat)] text-[12px] font-black text-[var(--primary-color)]">0{i+1}</span>
              <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)] leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'wikimold',
    label: '7. WikiMold',
    title: '7. WikiMold Content',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          The WikiMold database contains reference information on mold genera authored and validated by BPI mycologists. 
          You agree that:
        </p>
        <ul className="space-y-5 font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)]">
          {[
            "WikiMold content is provided for general educational and reference purposes only.",
            "WikiMold content does not constitute a formal diagnosis of any specific crop disease or condition.",
            "Only authorized BPI mycologists may create or modify WikiMold content. Client users may not submit or edit WikiMold articles."
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
    id: 'ip',
    label: '8. IP',
    title: '8. Intellectual Property',
    content: (
      <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] leading-relaxed text-[var(--moldify-black)]">
        All content, software, design, and materials comprising the Moldify platform, including but not limited to the
        application code, UI design, AI model architecture, and WikiMold content, are the intellectual property of the
        Moldify development team and the Bureau of Plant Industry, as applicable. You may not reproduce, distribute,
        modify, or create derivative works from any Moldify content without prior written authorization.
      </p>
    ),
  },
  {
    id: 'privacy',
    label: '9. Privacy',
    title: '9. Data Privacy',
    content: (
      <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] leading-relaxed text-[var(--moldify-black)]">
        Your use of Moldify is also governed by the Moldify Privacy Policy, which is incorporated into these Terms by
        reference. By agreeing to these Terms, you also acknowledge and accept the Moldify Privacy Policy. The Privacy
        Policy describes how we collect, use, store, and protect your personal data in compliance with Republic Act No.
        10173 (Data Privacy Act of 2012).
      </p>
    ),
  },
  {
    id: 'liability',
    label: '10. Liability',
    title: '10. Limitation of Liability',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          To the fullest extent permitted by applicable Philippine law, Moldify and BPI shall not be liable for:
        </p>
        <ul className="space-y-5 font-[family-name:var(--font-bricolage-grotesque)] text-[16px] text-[var(--moldify-black)]">
          {[
            "Any indirect, incidental, or consequential damages arising from your use of or inability to use the platform",
            "Any loss or damage to crops, harvests, or agricultural output based on mold investigation findings delivered through Moldify",
            "Any inaccuracy in AI-assisted mold classification results",
            "System downtime, technical errors, or interruptions in service"
          ].map((item, i) => (
            <li key={i} className="flex gap-5 items-start">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary-color)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="pt-8 border-t border-[var(--primary-color)]/10 font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-relaxed text-[var(--moldify-black)] italic opacity-70">
          Moldify is provided on an 'as is' and 'as available' basis. BPI and the Moldify development team make no
          warranties, express or implied, regarding the platform's fitness for any particular purpose beyond those
          explicitly stated herein.
        </p>
      </div>
    ),
  },
  {
    id: 'modification',
    label: '11. Changes',
    title: '11. Modification of Terms',
    content: (
      <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] leading-relaxed text-[var(--moldify-black)]">
        Moldify and BPI reserve the right to modify these Terms at any time. Updated Terms will be posted within the
        application with a revised Effective Date. Continued use of the platform following any modification
        constitutes your acceptance of the revised Terms.
      </p>
    ),
  },
  {
    id: 'law',
    label: '12. Law',
    title: '12. Governing Law',
    content: (
      <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[16px] leading-relaxed text-[var(--moldify-black)]">
        These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines.
        Any disputes arising from these Terms or your use of Moldify shall be subject to the jurisdiction of the
        appropriate courts of the Philippines.
      </p>
    ),
  },
  {
    id: 'contact',
    label: '13. Contact',
    title: '13. Contact Information',
    content: (
      <div className="space-y-8">
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[18px] leading-relaxed text-[var(--moldify-black)]">
          For questions or concerns regarding these Terms, please contact:
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

export default function TermsPage() {
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
          Terms of Agreement
        </h1>
        <p className="max-w-3xl mx-auto font-medium text-[var(--primary-color)] text-md md:text-lg leading-relaxed">
          By using the Moldify app or website, you agree to these Terms. If you do   <br />
          not agree, do not use the platform.
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
