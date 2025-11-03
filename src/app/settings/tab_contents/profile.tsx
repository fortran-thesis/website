"use client";
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
}

export default function ProfileCard({
  data,
  onChange,
  onSave,
  onChangePicture,
  onRemovePicture,
}: ProfileCardProps) {
  const [userData, setUserData] = useState(data);
  const [imgSrc, setImgSrc] = useState(
    data.profilePicture || "/assets/default-fallback.png"
  );

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-8 mt-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">
          Profile
        </h2>
        <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
          Update your account information.
        </p>
      </div>

      {/* Image Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-40 h-40 rounded-full overflow-hidden">
            <Image
              src={imgSrc}
              alt="Profile Picture"
              fill
              className="object-cover rounded-full"
              onError={() => setImgSrc("/assets/default-fallback.png")}
              priority
            />
          </div>
          <div>
            <h2 className="font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-lg">
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="text-sm text-[var(--moldify-grey)] font-[family-name:var(--font-bricolage-grotesque)]">
              {userData.role}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:items-center mt-4 md:mt-0">
          <label
            htmlFor="uploadInput"
            className="bg-[var(--accent-color)] hover:bg-[var(--hover-accent)] text-[var(--moldify-black)] px-6 py-2 rounded-md text-xs font-[family-name:var(--font-bricolage-grotesque)] font-semibold transition cursor-pointer flex items-center justify-center"
          >
            Change Profile Picture
          </label>
          <input
            id="uploadInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {imgSrc !== "/assets/default-fallback.png" && (
            <button
              type="button"
              onClick={handleRemovePicture}
              className="text-xs text-[var(--moldify-red)] mt-1 font-[family-name:var(--font-bricolage-grotesque)] hover:underline cursor-pointer"
            >
              Remove Profile Picture
            </button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="border border-[var(--moldify-softGrey)] rounded-lg p-8 bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-2"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={userData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 mb-1 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-2"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={userData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 mb-1 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="email"
            className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={userData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 mb-1 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Save Button */}
      <div>
        <button
          type="submit"
          className="bg-[var(--primary-color)] hover:bg-[var(--hover-primary)] text-[var(--background-color)] px-10 py-3 rounded-lg font-semibold transition w-full md:w-auto cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
