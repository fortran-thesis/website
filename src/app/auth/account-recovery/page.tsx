"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import StepIndicator from "@/components/step_indicator";
import { useAccountRecovery1 } from './accountRecoveryUtils1';

const EmailImage = '/assets/email-recover-image.svg';

{/* This is the step 1 when user forgets password
    It asks the user to enter associated email address */}
export default function AccountRecovery() {
    const [stepLength, setStepLength] = useState(2);
    const [recoveryType, setRecoveryType] = useState("forgot-username");
    // This is the custom hook for forgot password step 1

    const {
        email,
        setEmail,
        isLoading,
        handleCancel,
        handleSendCode
    } = useAccountRecovery1();

    useEffect(() => {
        // Step 1 doesn't require protection - it's the entry point
        // Read recovery type from sessionStorage (set by login page)
        const type = typeof window !== "undefined" ? sessionStorage.getItem("recoveryType") || "forgot-username" : "forgot-username";
        setRecoveryType(type);
        setStepLength(type === "forgot-password" ? 3 : 2);
        // Prefill email from sessionStorage if it exists (returning user)
        const prefillEmail = typeof window !== "undefined" ? sessionStorage.getItem("recoveryEmail") : null;

        if (prefillEmail) {
            setEmail(prefillEmail);
        }
    }, [setEmail]);

    const headerLabel = recoveryType === "forgot-password" ? "Forgot Password" : "Forgot Username";

    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            {/* Added relative and overflow-hidden to contain the grass inside the card */}
            <main className="relative overflow-hidden p-5 font-[family-name:var(--font-bricolage-grotesque)] flex h-fit xl:flex-row w-full md:max-w-1/2 max-w-full shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
                <div className="w-full flex flex-col z-10">

                    {/* FORGOT PASSWORD HEADER - STEP 1*/}
                    <div className ="flex flex-row justify-between mb-8 sm:mb-10 items-center">
                        <p className="text-[var(--primary-color)] font-bold text-[10px] sm:text-xs">{headerLabel}</p>
                        <StepIndicator currentStep={1} length={stepLength} />
                    </div>
                    <div className="flex flex-col items-center justify-center mb-10">
                        <h1 className="font-[family-name:var(--font-montserrat)] font-black text-4xl text-[var(--primary-color)] text-center">
                            MAIL ADDRESS HERE 
                        </h1>
                        <p className="text-[var(--moldify-black)] font-regular text-center text-sm">Please enter the email associated to your account.</p>
                    </div>
                    {/* FORGOT PASSWORD FORM - STEP 1 */}
                    <form className="flex flex-col" onSubmit={handleSendCode}>
                        <label htmlFor="email" className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">Email</label>
                        {/* Email Textbox */}
                        <input
                        id = "email"
                        type="email"
                        placeholder="Enter email"
                        className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                        <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-20 mb-30">
                            <div className = "flex flex-col flex-1">
                                {/* Cancel Button */}
                                <button
                                type="button"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-full border-3 border-[var(--primary-color)] hover:bg-black/10 transition"
                                onClick={handleCancel}
                                >
                                Cancel
                                </button>  
                            </div>
                            <div className="flex flex-col flex-1">
                                {/* Send Code Button */}
                                <button
                                type="submit"
                                disabled={isLoading}
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-full hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                {isLoading ? "Sending..." : "Send Code"}
                                </button> 
                            </div>
                        </div>
                    </form>
                </div>

                {/* GRASS IMAGE AT THE BOTTOM OF THE CONTAINER */}
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
        </div>
    )
}