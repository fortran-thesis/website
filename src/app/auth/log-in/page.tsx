"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

{/* IMAGES */}
const GoogleIcon = '/assets/Google_Icon.svg';
const LogInImage = '/assets/LogIn_Image.svg';

{/* This is the log in page of the Moldify Website
  It allows platform managers and mold curators to log in to their accounts */}

export default function Auth() {
const [showPassword, setShowPassword] = useState(false);

// Handler to set which recovery type was clicked
const handleRecoveryClick = (type: "forgot-username" | "forgot-password") => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("recoveryType", type);
  }
};

  return (
      <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
        <main className="flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl  gap-x-10 bg-[var(--background-color)]">
          <div className="w-full xl:w-1/2 p-5 flex flex-col">
            {/* LOG IN HEADER*/}
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">HELLO THERE,</p>
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)]">WELCOME TO
              <span className="text-[var(--accent-color)]"> MOLDIFY</span>
            </h1>

            {/* LOG IN FORM*/}
            <form className="mt-8 flex flex-col" method = "POST">
                <label className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">Username</label>
                {/* Username Textbox */}
                <input
                  type="text"
                  placeholder="Enter username"
                  className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                  required
                />
                {/*  Forgot Username Button */}
                <Link 
                  href="./account-recovery"
                  onClick={() => handleRecoveryClick("forgot-username")}
                >
                  <label className="ml-1 text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-xs hover:underline cursor-pointer flex justify-end">
                    Forgot Username?
                  </label>
                </Link>

                <label className = "font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-8 mb-1">Password</label>
                {/* Password Textbox */}
                <div className="relative flex items-center overflow-clip">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none mb-1 w-full pr-10"
                    required
                  />

                  {/* Eye Toggle */}
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

                {/*  Forgot Password Button */}
                <Link 
                  href="./account-recovery"
                  onClick={() => handleRecoveryClick("forgot-password")}
                >
                  <label className="ml-1 text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-xs hover:underline cursor-pointer flex justify-end">
                    Forgot Password?
                  </label>
                </Link>

                {/* Log In Button */}
                <button
                type="submit"
                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 rounded-lg hover:bg-[var(--hover-primary)] transition mt-10"
                >
                Log In
                </button>
            </form>
              <p className="text-xs font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] mt-2 flex justify-center">
                Don't have an account?&nbsp;
                <Link href="./sign-up">
                {/* Sign Up Button */}
                  <span className="ml-1 text-[var(--accent-color)] font-bold hover:underline cursor-pointer">
                    Sign Up
                  </span>
                </Link>
              </p>

              {/* Continue With Label */}
              <div className="flex items-center my-10">
                <div className="flex-grow h-0.5 bg-[var(--moldify-black)]"></div>
                <span className="font-[family-name:var(--font-bricolage-grotesque)] mx-4 text-xs text-[var(--moldify-black)]">or continue with</span>
                <div className="flex-grow h-0.5 bg-[var(--moldify-black)]"></div>
              </div>

              {/* Continue with Google Button */}
              <button
                  type="button"
                  className="cursor-pointer flex items-center justify-center font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-lg border-3 gap-x-5 border-[var(--primary-color)] hover:bg-black/10 transition"
                  >
                    <Image
                      src={GoogleIcon}
                      alt="Google Icon"
                      width={32}
                      height={32}
                      className="object-contain rounded-xl"
                    />
                  Google
              </button>

              {/* Terms and Policy */}
              <p className="text-xs text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] my-4 text-center">
                By proceeding you acknowledge that you have read, understood and agree to our&nbsp;
                <Link
                  href="/terms"
                  className="text-[var(--accent-color)] font-semibold hover:underline"
                >
                  Terms of Use&nbsp;
                </Link>
                and&nbsp;
                <Link
                  href="/terms"
                  className="text-[var(--accent-color)] font-semibold hover:underline"
                >
                  Privacy Policy&nbsp;
                </Link>
              </p>
          </div>
          <div className="hidden relative w-1/2 xl:flex">
            <Image
              src={LogInImage}
              alt="Log In Illustration"
              fill
              className="object-cover rounded-xl"
            />
          </div>
        </main>
      </div>
  );
}
