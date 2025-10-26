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
    
    useEffect(() => {
        const type = sessionStorage.getItem("recoveryType") || "forgot-username";
        setRecoveryType(type);
        setStepLength(type === "forgot-password" ? 3 : 2);
    }, []);

    // This is the custom hook for forgot password step 1
    const {
        email,
        setEmail,
        handleCancel,
        handleSendCode
    } = useAccountRecovery1();

    const headerLabel = recoveryType === "forgot-password" ? "Forgot Password" : "Forgot Username";

    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            <main className="p-5 font-[family-name:var(--font-bricolage-grotesque)] flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl  gap-x-10 bg-[var(--background-color)]">
                <div className="w-full xl:w-1/2 flex flex-col">

                    {/* FORGOT PASSWORD HEADER - STEP 1*/}
                    <p className="text-[var(--primary-color)] font-bold text-xs mb-10">{headerLabel}</p>
                    <StepIndicator currentStep={1} length={stepLength} />
                    <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-3">MAIL ADDRESS
                        <span className="inline xl:block"> HERE </span>
                    </h1>
                    <p className="text-[var(--moldify-black)] font-regular text-sm mb-20">Please enter the email associated to your account.</p>

                    {/* FORGOT PASSWORD FORM - STEP 1 */}
                    <form className="flex flex-col" method = "POST">
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
                        <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-20">
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
                                {/* Send Code Button */}
                                <button
                                type="submit"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-lg hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition"
                                onClick={handleSendCode}
                                >
                                Send Code
                                </button> 
                            </div>
                        </div>
                    </form>
                </div>
                <div className="hidden relative w-1/2 xl:flex">
                    <Image
                        src={EmailImage}
                        alt="Forgot Password Illustration"
                        fill
                        className="object-cover rounded-xl"
                    />
                </div>
            </main>
        </div>
    )
}