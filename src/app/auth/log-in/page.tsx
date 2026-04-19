"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { setUserData } from '@/utils/auth';
import TopLoadingBar from '@/components/loading/top_loading_bar';
import MessageBanner from '@/components/feedback/message_banner';

{/* IMAGES */}
const LogInImage = '/assets/logIn_header.svg';
const LogInHeader = '/assets/logIn_header.svg';
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
    setIsLoading(true);
    setError(null);
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
        console.log('🟢 Login successful');
        // Store user data if provided in response
        if (data?.user) {
          console.log('📦 User in response, storing');
          setUserData(data.user);
        } else {
          console.log('⚠️ No user in response, fetching profile');
          // If backend didn't return user in JSON, fetch current user via session cookie
          try {
            console.log('🔄 Fetching /api/v1/user/profile...');
            const profileRes = await fetch('/api/v1/user/profile', { 
              credentials: 'include',
              cache: 'no-store'
            });
            console.log('📍 Profile status:', profileRes.status);
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              console.log('📥 Profile data:', profileData);
              const user = profileData?.data || profileData?.user || profileData;
              if (user) {
                setUserData(user);
                console.log('✅ Stored user');
              }
            }
          } catch (err) {
            console.error('❌ Profile fetch failed:', err);
          }
        }

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
      <>
      {/* Top Loading Bar */}
      <TopLoadingBar isVisible={isLoading} />

      <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-start bg-[#fcfaf2] overflow-hidden">
      
      {/* 1. BACKGROUND IMAGE - Hidden on mobile, visible on Extra Large screens (xl) */}
      <div className="absolute inset-0 z-0 hidden xl:block">
        <Image
          src={LogInHeader}
          alt="Login Background"
          fill
          priority
          className="object-cover object-right-top"
          style={{ objectPosition: 'right -60px' }}
        />
      </div>

      {/* 2. FORM CONTENT CONTAINER */}
      <div className="relative z-10 w-full xl:w-[50%] h-full flex flex-col justify-center items-center mt-25 xl:items-start px-8 md:px-20 lg:px-32">
        
        <div className="max-w-[480px] w-full">
          {/* LOGO */}
          <div className="flex items-center mb-6 space-x-2">
            <Image
              src={MoldifyLogov2}
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-md tracking-[0.2em]">MOLDIFY</p>
          </div>

          <h1 className="font-[family-name:var(--font-montserrat)] font-black text-5xl md:text-6xl text-[var(--primary-color)] mb-12 tracking-tight">LOG IN</h1>

          {error && (
            <MessageBanner variant="error" className="mb-6 text-xs text-center lg:text-left">
              {error}
            </MessageBanner>
          )}

          <form className="flex flex-col space-y-6" onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div className="flex flex-col">
              <label htmlFor="username" className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-bold mb-1.5 ml-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                className="bg-[var(--taupe)] py-3 px-5 rounded-xl font-[family-name:var(--font-bricolage-grotesque)] text-sm focus:outline-none"
                placeholder="Enter username"
                required
              />
              <button 
                type="button"
                onClick={() => handleRecoveryClick("forgot-username")}
                className="text-xs mt-1.5 self-end hover:underline text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] cursor-pointer"
              >
                Forgot Username?
              </button>
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col">
              <label htmlFor="password" className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-bold mb-1.5 ml-1">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="bg-[var(--taupe)] py-3 px-5 rounded-xl w-full font-[family-name:var(--font-bricolage-grotesque)] text-sm focus:outline-none pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 text-[var(--primary-color)] opacity-50 cursor-pointer hover:opacity-100 transition-all"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="w-4 h-4" />
                </button>
              </div>
              <button 
                type="button"
                onClick={() => handleRecoveryClick("forgot-password")}
                className="text-xs mt-1.5 self-end hover:underline text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <div className="pt-4 flex justify-center xl:justify-start ">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full xl:w-auto bg-[var(--primary-color)] text-white font-bold py-3.5 px-20 rounded-full font-[family-name:var(--font-bricolage-grotesque)] text-md hover:brightness-110 transition-all shadow-md active:scale-95 ${
                  isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer'
                }`}
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
