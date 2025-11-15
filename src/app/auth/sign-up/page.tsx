"use client";
import StepIndicator from "@/components/step_indicator";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useSignUp1Utils } from './signUp1Utils';

const LogInImage = '/assets/LogIn_Image.svg';

export default function SignUp() {

    // Custom hook for sign-up step 1
    const {
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleCancel,
        handleNext
    } = useSignUp1Utils();

    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            <main className="flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
                {/* TEMPORARY IMAGE FOR SIGN UP!!! */}
                <div className="hidden relative w-1/2 xl:flex transform scale-x-[-1]">
                    <Image
                        src={LogInImage}
                        alt="Log In Illustration"
                        fill
                        className="object-cover rounded-xl"
                    />
                </div>
                <div className="w-full xl:w-1/2 p-5 flex flex-col mt-0 xl:mt-2 max-h-auto xl:max-h-150 overflow-y-auto">
                    {/* SIGN UP HEADER*/}
                    <StepIndicator length={2} currentStep={1} />
                    <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-2">LET&apos;S SET UP YOUR
                        <span className="inline xl:block text-[var(--accent-color)]"> ACCOUNT</span>
                    </h1>

                    {/* SIGN UP FORM*/}
                    <form className = "mt-8 flex flex-col" method = "POST">
                         <label className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">Username</label>
                        {/* Username Textbox */}
                        <input
                        type="text"
                        placeholder="Enter username"
                        className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                        required
                        />
                        <div className = "flex flex-col xl:flex-row gap-x-5 gap-y-5 mt-5">
                            <div className = "flex flex-col flex-1">
                                <label className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">First Name</label>
                                {/* First Name Textbox */}
                                <input
                                type="text"
                                placeholder="Enter first name"
                                className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                                required
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className = "flex flex-col flex-1">
                                <label className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">Last Name</label>
                                {/* Last Name Textbox */}
                                <input
                                type="text"
                                placeholder="Enter last name"
                                className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                                required
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <label className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-5">Email</label>
                        {/* Email Textbox */}
                        <input
                        type="email"
                        placeholder="Enter email"
                        className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        />

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
                        <div className = "flex flex-col xl:flex-row gap-x-5 gap-y-5 mt-10">
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
                                {/* Next Button */}
                                <button
                                type="submit"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-lg hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition"
                                onClick={handleNext}
                                >
                                Next
                                </button> 
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}