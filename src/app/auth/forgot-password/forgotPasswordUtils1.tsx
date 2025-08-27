"use client";
import { useState} from 'react';
import { useRouter } from 'next/navigation';

export function forgotPasswordUtils1(){
    const [email, setEmail] = useState("");
    const router = useRouter();

    const hasChanges = () => email !== "";


    const handleCancel = () => {
        if (hasChanges() && confirm("Are you sure you want to cancel? All entered data will be lost.")) {
            setEmail("");
            router.back();
        }
        else if (!hasChanges()) {
            setEmail("");
            router.back();
        }
    }
    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/auth/login");
    }

    return {
        email,
        setEmail,
        handleCancel,
        handleNext
    }
}