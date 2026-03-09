import { useState} from 'react';
import { useRouter } from 'next/navigation';

export function useAccountRecoveryUtils3 (){
    // This handles the visibility of the password fields
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showCancelModal, setShowCancelModal] = useState(false);

    const router = useRouter();

    // This tracks changes in the input fields
    const hasChanges = () => {
        return (
            password !== "" ||
            confirmPassword !== ""
        );
    };

    // This handles the cancel button
    const handleCancel = () => {
        if (hasChanges()) {
            setShowCancelModal(true);
        } else {
            router.back();
        }
    };

    // This confirms the cancel action
    const confirmCancel = () => {
        setPassword("");
        setConfirmPassword("");
        setShowCancelModal(false);
        router.back();
    };

    // This closes the cancel modal
    const closeCancelModal = () => {
        setShowCancelModal(false);
    };

    // This handles the Change Password Button
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // This validates password and confirm password
        if (!password || !confirmPassword) {
            setError("Please fill in both fields.");
            return;
        }

        // Validate password complexity (must match server PasswordSchema)
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (!/[a-z]/.test(password)) {
            setError("Password must contain at least one lowercase letter.");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setError("Password must contain at least one uppercase letter.");
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError("Password must contain at least one number.");
            return;
        }
        if (!/[^a-zA-Z0-9]/.test(password)) {
            setError("Password must contain at least one special character.");
            return;
        }

        // This checks if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Read email and token from sessionStorage
        const email = typeof window !== "undefined" ? sessionStorage.getItem("recoveryEmail") : null;
        const token = typeof window !== "undefined" ? sessionStorage.getItem("recoveryToken") : null;

        if (!email || !token) {
            setError("Required parameters missing. Please restart the recovery process.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/v1/auth/verified-change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    token,
                    newPassword: password 
                }),
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error("Invalid response from server");
            }

            if (!response.ok) {
                throw new Error(data.message || "Failed to change password");
            }

            // Clear sessionStorage after successful password change
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("recoveryEmail");
              sessionStorage.removeItem("recoveryType");
              sessionStorage.removeItem("recoveryToken");
            }

            alert("Password changed successfully! Please log in with your new password.");
            router.push("/auth/log-in");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to change password";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showCancelModal,
        handleCancel,
        confirmCancel,
        closeCancelModal,
        handleChangePassword,
        isLoading,
        error,
    }
}