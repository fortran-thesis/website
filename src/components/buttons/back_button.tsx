"use client";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            aria-label="Go back"
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-[var(--primary-color)] bg-[var(--taupe)] rounded-full h-10 w-10 cursor-pointer hover:bg-[var(--moldify-black)]/10 transition"
        >
           <FontAwesomeIcon icon={faArrowLeft} className="text-[var(--primary-color)]" />
        </button>
    );
}
