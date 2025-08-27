"use client";
import Image from 'next/image';
import Link from 'next/link';
import StepIndicator from "@/components/step_indicator";
import { forgotPasswordUtils2 } from './forgotPasswordUtils2';

const CodeImage = '/assets/ForgotPassword_Code_Image.svg';

{/* This is the step 2 when user forgets password
    It asks the user to enter the 4-digit code sent to their email address */}

export default function ForgotPassword2() {
  const {
    codeSegments,
    handleCodeChange,
    fullCode,
    handleCancel,
    handleVerify,
  } = forgotPasswordUtils2();

  return (
    <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
      <main className="font-[family-name:var(--font-bricolage-grotesque)] flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
        <div className="w-full xl:w-1/2 p-5 flex flex-col">
          {/* FORGOT PASSWORD HEADER - STEP 2 */}
          <p className="text-[var(--accent-color)] font-bold text-xs mb-10">Forgot Password</p>
          <StepIndicator currentStep={2} length={3} />
          <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-3">
            GET YOUR CODE
          </h1>
          <p className="text-[var(--moldify-black)] font-regular text-sm mb-20">Please enter the 4-digit code sent to your email.</p>
          <form className="flex flex-col" method="POST">
            <div className="flex gap-x-13">
            {/* Textboxes to input the 4-digit code */}
              {codeSegments.map((segment, idx) => (
                <input
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
            <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-20">
                <div className = "flex flex-col flex-1">
                    {/* Cancel Button */}
                    <button
                    type="button"
                    className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-lg border-3 border-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-[var(--background-color)] transition"
                    onClick={handleCancel}
                    >
                    Cancel
                    </button>  
                </div>
                <div className="flex flex-col flex-1">
                    {/* Verify Code Button */}
                    <button
                    type="submit"
                    className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-lg hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition"
                    onClick={handleVerify}
                    >
                    Verify Code
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