"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAccountRecovery1(){
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const router = useRouter();

    // This tracks changes made by the user in the input fields
    const hasChanges = () => email !== "";

    // This handles the cancel button
    const handleCancel = () => {
        if (hasChanges()) {
            setShowCancelModal(true);
        } else {
            // Clear sessionStorage and navigate back
            if (typeof window !== "undefined") {
                sessionStorage.removeItem("recoveryEmail");
                sessionStorage.removeItem("recoveryType");
            }
            setEmail("");
            router.back();
        }
    }

    // This confirms the cancel action
    const confirmCancel = () => {
        // Clear sessionStorage before navigating back
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("recoveryEmail");
            sessionStorage.removeItem("recoveryType");
        }
        setEmail("");
        setShowCancelModal(false);
        router.back();
    }

    // This closes the cancel modal
    const closeCancelModal = () => {
        setShowCancelModal(false);
    }

    // This handles the Send Code Button
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert("Please enter your email address.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get recovery type from sessionStorage (set by login page)
            const type = typeof window !== "undefined" ? sessionStorage.getItem("recoveryType") || "forgot-username" : "forgot-username";

            const response = await fetch('/api/v1/auth/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, type }),
            });

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch {
                result = { error: 'Invalid response from server' };
            }

            if (!response.ok) {
                setError(result?.error || result?.message || 'Failed to send verification code');
                alert(result?.error || result?.message || 'Failed to send verification code');
                return;
            }

            // Store recovery data in sessionStorage for next steps
            if (typeof window !== "undefined") {
                sessionStorage.setItem("recoveryEmail", email);
                sessionStorage.setItem("recoveryType", type);
            }
            // Navigate to step 2 with clean URL (no query params)
            router.push("/auth/account-recovery-2");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return {
        email,
        setEmail,
        isLoading,
        error,
        showCancelModal,
        handleCancel,
        confirmCancel,
        closeCancelModal,
        handleSendCode
    }
}