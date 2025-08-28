"use client";
import Image from 'next/image';
import StepIndicator from "@/components/step_indicator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useForgotPasswordUtils3 } from './forgotPasswordUtils3';

const PasswordImage = '/assets/ForgotPassword_Password_Image.svg';

{/* This is the step 3 when user forgets password
    It asks the user to enter their new password and confirm password to reset their password */}

export default function ForgotPassword3() {
    const {
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleCancel,
        handleChangePassword
    } = useForgotPasswordUtils3();

    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            <main className="font-[family-name:var(--font-bricolage-grotesque)] flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
                <div className="w-full xl:w-1/2 p-5 flex flex-col">
                    {/* FORGOT PASSWORD HEADER - STEP 3 */}
                    <p className="text-[var(--accent-color)] font-bold text-xs mb-10">Forgot Password</p>
                    <StepIndicator currentStep={3} length={3} />
                    <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-3">
                        SET NEW <span className = "inline-block xl:block"> PASSWORD </span> 
                    </h1>
                    <p className="text-[var(--moldify-black)] font-regular text-sm mb-10">Please enter new password to update your account</p>
                    <form className="flex flex-col" method="POST">
                        <label className = "font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-5 mb-1">Password</label>
                        {/* Password Textbox */}
                        <div className="relative flex items-center overflow-clip">
                            <input
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
                                className="p-2 cursor-pointer rounded-full bg-transparent absolute right-2 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:bg-black/10 transition"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="w-15 h-7" />
                            </button>
                        </div>

                        <label className = "font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-5 mb-1">Confirm Password</label>
                        
                        {/* Confirm Password Textbox */}
                        <div className="relative flex items-center overflow-clip">
                            <input
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
                                className="p-2 cursor-pointer rounded-full bg-transparent absolute right-2 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:bg-black/10 transition"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="w-15 h-7" />
                            </button>
                        </div>
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
                                {/* Change Password Button */}
                                <button
                                type="submit"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-lg hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition"
                                onClick={handleChangePassword}
                                >
                                Change Password
                                </button> 
                            </div>
                        </div>
                    </form>
                </div>
                <div className="hidden relative w-1/2 xl:flex">
                    <Image
                        src={PasswordImage}
                        alt="Forgot Password Illustration"
                        fill
                        className="object-cover rounded-xl"
                    />
                </div>
            </main>
        </div>
    )
}