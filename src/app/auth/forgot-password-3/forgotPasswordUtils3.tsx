import { useState} from 'react';
import { useRouter } from 'next/navigation';

export function forgotPasswordUtils3 (){
    // This handles the visibility of the password fields
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const router = useRouter();

    const hasChanges = () => {
        return (
            password !== "" ||
            confirmPassword !== ""
        );
    };

    const handleCancel = () => {
        if (hasChanges() && confirm("Are you sure you want to cancel? You will lose all progress")) {
            setPassword("");
            setConfirmPassword("");
            router.back();
        }
        else if (!hasChanges()) {
            router.back();
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            alert("Please fill in both fields.");
            return;
        }
        if (password === confirmPassword) {
            // Call API to change password
        } else {
            alert("Passwords do not match");
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
        handleCancel,
        handleChangePassword
    }
}