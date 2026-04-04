"use client";
import { faCamera, faFingerprint, faSignature, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture?: string;
}

interface ProfileCardProps {
  data: ProfileData;
  onChange: (updatedData: ProfileData) => void;
  onSave: () => void;
  onChangePicture: (file: File) => void;
  onRemovePicture: () => void;
  isLoading?: boolean;
}

export default function ProfileCard({
  data,
  onChange,
  onSave,
  onChangePicture,
  onRemovePicture,
  isLoading = false,
}: ProfileCardProps) {
  const [userData, setUserData] = useState(data);
  const [imgSrc, setImgSrc] = useState(
    data.profilePicture || "/assets/default-fallback.png"
  );

  // Sync userData whenever parent data changes
  useEffect(() => {
    console.log('📍 ProfileCard data prop changed:', data);
    setUserData(data);
  }, [data]);

  // Keep image in sync if parent updates it
  useEffect(() => {
    if (data.profilePicture) {
      setImgSrc(data.profilePicture);
    }
  }, [data.profilePicture]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    const updated = { ...userData, [field]: value };
    setUserData(updated);
    onChange(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show instant preview
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) setImgSrc(reader.result as string);
      };
      reader.readAsDataURL(file);

      onChangePicture(file); // Send file to parent
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  const handleRemovePicture = () => {
    setImgSrc("/assets/default-fallback.png");
    onRemovePicture();
  };

  const labelStyle = "font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] mb-2 block opacity-50";
  
  // Refined "Premium" Input: Soft background, subtle ring on focus, and Bricolage font
  const inputStyle = "w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3.5 px-5 rounded-xl border border-transparent focus:border-[var(--primary-color)]/20 focus:bg-white focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <main className="mx-auto w-full py-10 px-6">

      <header className="mt-10 mb-12 flex flex-col gap-2">
        <h1 className="text-4xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] uppercase tracking-tighter">
          My Profile
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)] opacity-60">
          Update your account information.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={`space-y-12 ${isLoading ? "cursor-wait" : ""}`}>
        
        {/* Profile Identity Card */}
        <section className="bg-[var(--primary-color)]/0.05 border border-[var(--primary-color)]/5 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative ring-1 ring-[var(--primary-color)]/5">
              <Image
                src={imgSrc}
                alt="Profile"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                onError={() => setImgSrc("/assets/default-fallback.png")}
              />
            </div>
            <label htmlFor="uploadInput" className="absolute bottom-1 right-1 bg-[var(--primary-color)] text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:bg-[var(--accent-color)] hover:text-[var(--moldify-black)] transition-all border-2 border-white">
              <FontAwesomeIcon icon={faCamera} className="text-[11px]" />
            </label>
            <input id="uploadInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="flex-grow space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] uppercase tracking-tight">
                {userData.firstName} {userData.lastName}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
                  System {userData.role}
                </p>
              </div>
            </div>

            {imgSrc !== "/assets/default-fallback.png" && (
              <button type="button" onClick={handleRemovePicture} className="text-[9px] font-black uppercase tracking-widest text-[var(--moldify-red)] hover:opacity-50 transition-opacity">
                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                Remove Avatar
              </button>
            )}
          </div>
        </section>

        {/* Input Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="space-y-2">
            <label className={labelStyle}>
              <FontAwesomeIcon icon={faSignature} className="mr-2 opacity-30" />
              First Name
            </label>
            <input 
              type="text" 
              value={userData.firstName} 
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={inputStyle}
              placeholder="e.g. John David"
            />
          </div>

          <div className="space-y-2">
            <label className={labelStyle}>
              <FontAwesomeIcon icon={faFingerprint} className="mr-2 opacity-30" />
              Last Name
            </label>
            <input 
              type="text" 
              value={userData.lastName} 
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={inputStyle}
              placeholder="e.g. Atienza"
            />
          </div>
        </section>

        {/* Action Footer */}
        <footer className="pt-8 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative overflow-hidden bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] text-[11px] font-black uppercase tracking-[0.3em] px-14 py-4 rounded-2xl shadow-xl hover:shadow-[var(--accent-color)]/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="relative z-10">{isLoading ? "Processing..." : "Save Profile Changes"}</span>
            <div className="absolute inset-0 bg-[var(--accent-color)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <style jsx>{`
              button:hover span { color: var(--moldify-black); transition: color 0.3s ease; }
            `}</style>
          </button>
        </footer>
      </form>
    </main>
  );
}
