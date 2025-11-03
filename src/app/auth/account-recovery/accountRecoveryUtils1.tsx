"use client";
import { useState} from 'react';
import { useRouter } from 'next/navigation';

export function useAccountRecovery1(){
    const [email, setEmail] = useState("");
    const router = useRouter();

    // This tracks changes made by the user in the input fields
    const hasChanges = () => email !== "";

    // This handles the cancel button
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

    // This handles the Send Code Button
    const handleSendCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert("Please enter your email address.");
            return;
        } else {
            router.push("/auth/account-recovery-2");
        }
    }

    return {
        email,
        setEmail,
        handleCancel,
        handleSendCode
    }
}