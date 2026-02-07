"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import StepIndicator from "@/components/step_indicator";
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/modals/confirmation_modal';
import { useAccountRecoveryUtils2 } from './accountRecoveryUtils2';

const CodeImage = '/assets/code-recover-image.svg';

export default function AccountRecovery2() {
  const [stepLength, setStepLength] = useState(2);
  const [recoveryType, setRecoveryType] = useState("forgot-username");
  const router = useRouter();
    
  useEffect(() => {
    const email = typeof window !== "undefined" ? sessionStorage.getItem("recoveryEmail") : null;
    const type = typeof window !== "undefined" ? sessionStorage.getItem("recoveryType") : null;

    if (!email || !type) {
      console.warn("⚠️ Step 2 accessed without email or type in sessionStorage - redirecting to step 1");
      router.push("/auth/account-recovery");
      return;
    }

    setRecoveryType(type);
    setStepLength(type === "forgot-password" ? 3 : 2);
  }, [router]);

  const {
    codeSegments,
    handleCodeChange,
    showCancelModal,
    handleCancel,
    confirmCancel,
    closeCancelModal,
    handleVerify,
    isLoading,
    error,
    successMessage,
  } = useAccountRecoveryUtils2();

  const headerLabel = recoveryType === "forgot-password" ? "Forgot Password" : "Forgot Username";

  return (
    <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
      <main className="relative overflow-hidden p-5 font-[family-name:var(--font-bricolage-grotesque)] flex h-fit xl:flex-row w-full md:max-w-1/2 max-w-full shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
          <div className="w-full flex flex-col z-10">
          
          {/* FORGOT PASSWORD HEADER - STEP 2 */}
          <div className ="flex flex-row justify-between mb-8 sm:mb-10 items-center">
            <p className="text-[var(--primary-color)] font-bold text-[10px] sm:text-xs">{headerLabel}</p>
            <StepIndicator currentStep={2} length={stepLength} />
          </div>

          <div className="flex flex-col items-center justify-center mb-10">
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] text-center uppercase">
              GET YOUR CODE
            </h1>
            <p className="text-[var(--moldify-black)] font-regular text-center text-sm">Please enter the 4-digit code sent to your email.</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs text-left">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-xs text-left">
              {successMessage}
            </div>
          )}

          <form className="flex flex-col" onSubmit={handleVerify}>
            {/* Responsive Inputs: 
               Using 'flex-1' and 'aspect-square' ensures they stay as boxes 
               without forcing the container to a size it can't handle.
            */}
            <div className="flex gap-x-2 sm:gap-x-4 md:gap-x-6 justify-center">
              {codeSegments.map((segment, idx) => (
                <input
                  aria-label="code-input"
                  key={idx}
                  id={`code-box-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="flex-1 aspect-square max-w-[80px] text-center font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-xl sm:text-2xl bg-[var(--taupe)] rounded-lg sm:rounded-xl focus:outline-none appearance-none"
                  value={segment}
                  onChange={e => handleCodeChange(idx, e.target.value)}
                  required
                />
              ))}
            </div>

            <p className="flex mt-3 justify-center items-center text-sm font-semibold text-[var(--moldify-black)]"> 
                If you didn&apos;t receive code,&nbsp;
                <Link href="#" className="text-[var(--primary-color)] font-black hover:underline"> Resend</Link>
            </p>

            <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-20 mb-30">
                <div className = "flex flex-col flex-1">
                    <button
                    type="button"
                    className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-full border-3 border-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all duration-300 ease-in-out active:scale-[0.98]"                    
                    onClick={handleCancel}
                    >
                    Cancel
                    </button>  
                </div>
                <div className="flex flex-col flex-1">
                    <button
                    type="submit"
                    className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-full hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"                    
                    disabled={isLoading}
                    >
                    {isLoading ? "Verifying..." : "Verify Code"}
                    </button> 
                </div>
            </div>
          </form>
        </div>

        {/* GRASS IMAGE AT THE BOTTOM - Matches Step 1 exactly */}
        <div className="absolute -bottom-10 md:-bottom-5 lg:-bottom-10 xl:-bottom-18 left-0 w-full leading-[0] pointer-events-none">
            <Image 
                src="/assets/grass.png" 
                alt="Grass decoration" 
                width={800} 
                height={100} 
                className="w-full h-auto object-cover opacity-90"
            />
        </div>
      </main>
      
      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onConfirm={confirmCancel}
        onCancel={closeCancelModal}
        title="Cancel Account Recovery?"
        subtitle="Are you sure you want to cancel? All entered data will be lost."
        confirmText="Yes, Cancel"
        cancelText="No, Go Back"
      />
    </div>
  );
}