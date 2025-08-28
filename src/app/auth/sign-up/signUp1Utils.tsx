import { useState} from 'react';
import { useRouter } from 'next/navigation';

/// This is the first sign-up step utility hook
/// It manages the state and behavior for the first step of the sign-up process

export function useSignUp1Utils() {
        // This handles the visibility of the password fields
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
        // This handles the form submission
        const [firstName, setFirstName] = useState("");
        const [lastName, setLastName] = useState("");
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const router = useRouter();

        // This tracks changes made by the user in the input fields
        const hasChanges = () => {
            return (
                firstName !== "" ||
                lastName !== "" ||
                email !== "" ||
                password !== "" ||
                confirmPassword !== ""
            );
        };

        // This handles the cancel button by clearing all fields
        const handleCancel = () => {
            if (hasChanges() && confirm("Are you sure you want to cancel? You will lose all progress")) {
                setFirstName("");
                setLastName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                router.back();
            }
            else if (!hasChanges()) {
                router.back();
            }
        };
    
        // This handles the next button
        const handleNext = (e: React.FormEvent) => {
            e.preventDefault();
            // TODO: Pass data to next page 
            // For now, just navigate

            // This validates all fields
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                alert("Please fill in all fields.");
                return;
            }
            
            // This checks if passwords match
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
            router.push("/auth/sign-up-2");
        };
    
    // This is used to expose the state and functions
    return {
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleCancel,
        handleNext
    };
}