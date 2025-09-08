"use client"
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
    // Dummy user object for demonstration; replace with actual user data as needed
    const user = { profileImageUrl: "/assets/FallBack_Image.png" };

    return (
        <main className="flex flex-col sm:py-2 py-10">
            <div className ="flex flex-row justify-space-between">
                <div className="flex flex-col">
                    <p className = "font-[family-name:var(--font-bricolage-grotesque)] text-[var(--accent-color)] font-regular text-sm">Temporary Bread Crumbs</p>
                    <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">DASHBOARD</h1>
                </div>
                <div className="w-full flex flex-row justify-end gap-x-15">
                    <FontAwesomeIcon
                        icon={faBell}
                        className="text-[var(--primary-color)] ml-5 mt-1 cursor-pointer hover:text-[var(--hover-primary)] transition"
                        style={{ width: '24px', height: '24px' }}
                    />

                    <div className="relative ml-5">
                        <Image
                            src={user?.profileImageUrl || "/assets/FallBack_Image.png"}
                            alt="Profile picture"
                            width={40}
                            height={40}
                            className="cursor-pointer rounded-full shadow-md"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/assets/FallBack_Image.png";
                            }}
                        />
                    </div>
                </div>
            </div>

        </main>
    );
}

