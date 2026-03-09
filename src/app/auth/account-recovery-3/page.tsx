"use client";
import Image from 'next/image';
import StepIndicator from "@/components/step_indicator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/modals/confirmation_modal';
import { useAccountRecoveryUtils3 } from './accountRecoveryUtils3';
import { useEffect } from 'react';

const PasswordImage = '/assets/password-recover-image.svg';

{/* This is the step 3 when user forgets password
    It asks the user to enter their new password and confirm password to reset their password */}

export default function AccountRecovery3() {
    const router = useRouter();

    useEffect(() => {
        // GUARD: Step 3 requires email, type, and token in sessionStorage (from Step 2)
        const email = typeof window !== "undefined" ? sessionStorage.getItem("recoveryEmail") : null;
        const token = typeof window !== "undefined" ? sessionStorage.getItem("recoveryToken") : null;
        const type = typeof window !== "undefined" ? sessionStorage.getItem("recoveryType") : null;

        // If any of these are missing, redirect back to step 1 (can't recover without completing steps 1-2)
        if (!email || !token || !type) {
            console.warn("⚠️ Step 3 accessed without email, token, or type in sessionStorage - redirecting to step 1");
            router.push("/auth/account-recovery");
            return;
        }
    }, [router]);

    const {
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showCancelModal,
        handleCancel,
        confirmCancel,
        closeCancelModal,
        handleChangePassword,
        isLoading,
        error,
    } = useAccountRecoveryUtils3();
    
    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            <main className="relative overflow-hidden p-5 font-[family-name:var(--font-bricolage-grotesque)] flex h-fit xl:flex-row w-full md:max-w-1/2 max-w-full shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
                <div className="w-full flex flex-col z-10">
                    {/* FORGOT PASSWORD HEADER - STEP 3 */}
                    <div className ="flex flex-row justify-between mb-8 sm:mb-10 items-center">
                        <p className="text-[var(--primary-color)] font-bold text-[10px] sm:text-xs">Forgot Password</p>
                        <StepIndicator currentStep={3} length={3} />
                    </div>
                    <div className="flex flex-col items-center justify-center mb-10">
                        <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-3">
                            SET NEW  PASSWORD 
                        </h1>
                        <p className="text-[var(--moldify-black)] font-regular text-sm mb-5">Please enter new password to update your account</p>
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm mb-5">{error}</p>
                    )}
                    <form className="flex flex-col" onSubmit={handleChangePassword}>
                        <label htmlFor="password" className = "font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-5 mb-1">Password</label>
                        {/* Password Textbox */}
                        <div className="relative flex items-center overflow-clip">
                            <input
                                id = "password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none mb-1 w-full pr-10"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            {/* Eye Toggle For Password*/}
                            <button
                                type="button"
                                className="absolute right-4 text-[var(--primary-color)] opacity-50 cursor-pointer hover:opacity-100 transition-all"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="w-15 h-7" />
                            </button>
                        </div>

                        <label htmlFor="confirm-password" className = "font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-5 mb-1">Confirm Password</label>
                        
                        {/* Confirm Password Textbox */}
                        <div className="relative flex items-center overflow-clip">
                            <input
                                id = "confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Enter confirm password"
                                className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none mb-1 w-full pr-10"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />

                            {/* Eye Toggle For Confirm Password */}
                            <button
                                type="button"
                                className="absolute right-4 text-[var(--primary-color)] opacity-50 cursor-pointer hover:opacity-100 transition-all"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="w-15 h-7" />
                            </button>
                        </div>
                        <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-20 mb-30">
                            <div className = "flex flex-col flex-1">
                                {/* Cancel Button */}
                                <button
                                type="button"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-full border-3 border-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-all duration-300 ease-in-out active:scale-[0.98]"                    
                                onClick={handleCancel}
                                >
                                Cancel
                                </button>  
                            </div>
                            <div className="flex flex-col flex-1">
                                {/* Change Password Button */}
                                <button
                                type="submit"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-full hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"                    
                                disabled={isLoading}
                                >
                                {isLoading ? "Changing..." : "Change Password"}
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
            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={showCancelModal}
                onConfirm={confirmCancel}
                onCancel={closeCancelModal}
                title="Cancel Password Reset?"
                subtitle="Are you sure you want to cancel? You will lose all progress."
                confirmText="Yes, Cancel"
                cancelText="No, Go Back"
            />        </div>
    )
}