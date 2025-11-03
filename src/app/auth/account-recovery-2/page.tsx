"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import StepIndicator from "@/components/step_indicator";
import { useRouter } from 'next/navigation';
import { useAccountRecoveryUtils2 } from './accountRecoveryUtils2';

const CodeImage = '/assets/code-recover-image.svg';

{/* This is the step 2 when user forgets password
    It asks the user to enter the 4-digit code sent to their email address */}

export default function AccountRecovery2() {
  const [stepLength, setStepLength] = useState(2);
  const [recoveryType, setRecoveryType] = useState("forgot-username");
  const router = useRouter();
    
  useEffect(() => {
    // GUARD: Step 2 requires email and type in sessionStorage (from Step 1)
    const email = typeof window !== "undefined" ? sessionStorage.getItem("recoveryEmail") : null;
    const type = typeof window !== "undefined" ? sessionStorage.getItem("recoveryType") : null;

    // If either email or type is missing, redirect back to step 1
    if (!email || !type) {
      console.warn("⚠️ Step 2 accessed without email or type in sessionStorage - redirecting to step 1");
      router.push("/auth/account-recovery");
      return;
    }

    setRecoveryType(type);
    setStepLength(type === "forgot-password" ? 3 : 2);
  }, [router]);

  // This is the custom hook for forgot password step 2    
  const {
    codeSegments,
    handleCodeChange,
    fullCode,
    handleCancel,
    handleVerify,
    isLoading,
    error,
  } = useAccountRecoveryUtils2();

  const headerLabel = recoveryType === "forgot-password" ? "Forgot Password" : "Forgot Username";

  return (
    <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
      <main className="p-5 font-[family-name:var(--font-bricolage-grotesque)] flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
        <div className="w-full xl:w-1/2 flex flex-col">
          {/* FORGOT PASSWORD HEADER - STEP 2 */}
          <p className="text-[var(--primary-color)] font-bold text-xs mb-10">{headerLabel}</p>
          <StepIndicator currentStep={2} length={stepLength} />
          <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-3">
            GET YOUR CODE
          </h1>
          <p className="text-[var(--moldify-black)] font-regular text-sm mb-10">Please enter the 4-digit code sent to your email.</p>
          {error && (
            <p className="text-red-500 text-sm mb-5">{error}</p>
          )}
          <form className="flex flex-col" onSubmit={handleVerify}>
            <div className="flex gap-x-13">
            {/* Textboxes to input the 4-digit code */}
              {codeSegments.map((segment, idx) => (
                <input
                  aria-label="code-input"
                  key={idx}
                  id={`code-box-${idx}`}
                  type="number"
                  inputMode="numeric"
                  maxLength={1}
                  className="flex-1 w-2 h-17 text-center items-center justify-center font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-lg bg-[var(--taupe)] rounded-lg focus:outline-none tracking-widest"
                  value={segment}
                  onChange={e => handleCodeChange(idx, e.target.value)}
                  required
                />
              ))}
            </div>
            <p className="flex mt-3 justify-center items-center text-xs font-semibold text-[var(--moldify-black)]"> If you didn't receive code,&nbsp;
                {/* Resend Code Button */}
                <Link href="#" className="text-[var(--primary-color)] font-black hover:underline"> Resend</Link>
            </p>
            <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-10">
                <div className = "flex flex-col flex-1">
                    {/* Cancel Button */}
                    <button
                    type="button"
                    className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-lg border-3 border-[var(--primary-color)] hover:bg-black/10 transition"
                    onClick={handleCancel}
                    >
                    Cancel
                    </button>  
                </div>
                <div className="flex flex-col flex-1">
                    {/* Verify Code Button */}
                    <button
                    type="submit"
                    className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-lg hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    >
                    {isLoading ? "Verifying..." : "Verify Code"}
                    </button> 
                </div>
            </div>
          </form>
        </div>
            <div className="hidden relative w-1/2 xl:flex">
                <Image
                    src={CodeImage}
                    alt="Forgot Password Illustration"
                    fill
                    className="object-cover rounded-xl"
                />
            </div>
        </main>
    </div>
  );
}