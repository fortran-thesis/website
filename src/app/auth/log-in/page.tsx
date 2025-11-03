"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { setUserData } from '@/utils/auth';

{/* IMAGES */}
const GoogleIcon = '/assets/Google_Icon.svg';
const LogInImage = '/assets/LogIn_Image.svg';
const MoldifyLogov2 = '/assets/moldify-logo-v3.svg';

{/* This is the log in page of the Moldify Website
  It allows platform managers and mold curators to log in to their accounts */}

export default function Auth() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Handler to set which recovery type was clicked
  const handleRecoveryClick = (type: "forgot-username" | "forgot-password") => {
    // Set recovery type in sessionStorage for account recovery pages
    if (typeof window !== "undefined") {
      sessionStorage.setItem("recoveryType", type);
    }
    router.push("/auth/account-recovery");
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call our same-origin proxy which will forward to the auth backend
      const proxyRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
        credentials: 'include',
      });

      const data = await proxyRes.json().catch(() => ({}));
      console.log('🔍 Login proxy response:', proxyRes.status, data);

      if (proxyRes.ok && (data.success || proxyRes.status === 200)) {
        // Proxy should set a same-origin HttpOnly cookie (session) when login succeeds
        if (data?.user) setUserData(data.user);

        // Small delay to let browser persist cookie
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.href = '/dashboard';
      } else {
        setError(data?.error || data?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
        <main className="p-5 flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl  gap-x-10 bg-[var(--background-color)]">
          <div className="w-full xl:w-1/2 flex flex-col">
            {/* LOG IN HEADER*/}
            <div className = "flex justify-space-between items-center mb-10 space-x-3">
              <Image
                src={MoldifyLogov2}
                alt="Moldify Logo"
                width={32}
                height={32}
                className="object-contain rounded-xl"
              />
              <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-sm">MOLDIFY</p>
            </div>
            
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)]">LOG IN</h1>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* LOG IN FORM*/}
            <form className="mt-8 flex flex-col" onSubmit={handleSubmit}>
                <label
                  htmlFor="username" 
                  className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">
                    Username
                </label>
                {/* Username Textbox */}
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 mb-1 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                {/*  Forgot Username Button */}
                <Link href="/auth/account-recovery" onClick={(e) => { e.preventDefault(); handleRecoveryClick("forgot-username"); }}>
                  <p className="ml-1 text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-xs hover:underline cursor-pointer flex justify-end">
                    Forgot Username?
                  </p>
                </Link>

                <label 
                  htmlFor="password"
                  className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-8 mb-1">
                    Password
                </label>
                {/* Password Textbox */}
                <div className="relative flex items-center overflow-clip">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none mb-1 w-full pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <Link href="/auth/account-recovery" onClick={(e) => { e.preventDefault(); handleRecoveryClick("forgot-password"); }}>
                  <p className="ml-1 text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-xs hover:underline cursor-pointer flex justify-end">
                    Forgot Password?
                  </p>
                </Link>

                {/* Log In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-3 rounded-lg hover:bg-[var(--hover-primary)] transition mt-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>
            </form>
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
