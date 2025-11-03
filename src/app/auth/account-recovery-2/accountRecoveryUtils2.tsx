"use client";
import { useState} from 'react';
import { useRouter } from 'next/navigation';

// This is a custom hook for managing the account recovery step 2 state

export function useAccountRecoveryUtils2(){

    const [codeSegments, setCodeSegments] = useState(["", "", "", ""]);
    const router = useRouter();
      // This handles changes in each individual digit input box
      const handleCodeChange = (idx: number, value: string) => {

        //This prevents user from entering more than 1 digit
        if (value.length > 1) return;
        const newSegments = [...codeSegments];
        newSegments[idx] = value.replace(/[^0-9]/g, "");
        setCodeSegments(newSegments);

        // This moves the focus to the next input box 
        // if a digit is entered and it's not the last input box
        if (value.length === 1 && idx < 3) {
          const nextInput = document.getElementById(`code-box-${idx + 1}`);
          if (nextInput) nextInput.focus();
        }

        // This moves focus to the previous input box 
        // if the user pressed back space and it's not the first input box
        if (value.length === 0 && idx > 0) {
          const prevInput = document.getElementById(`code-box-${idx - 1}`);
          if (prevInput) prevInput.focus();
        }
      };
      
      // This combines all individual digit inputs into a single string
      const fullCode = codeSegments.join("");

      // This tracks changes made by the user in the input fields
      const hasChanges = fullCode !== "";

      // This handles the Cancel Button
      const handleCancel = () =>{
        if((hasChanges) && confirm("Are you sure you want to cancel? All entered data will be lost.")) {
          setCodeSegments(["", "", "", ""]);
          router.back();
        } else if (!hasChanges) {
          router.back();
        }
      }

      // This handles the Verify Code Button
      const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (fullCode.length === 4) {
          // Check recovery type from sessionStorage
            const recoveryType = typeof window !== "undefined" ? sessionStorage.getItem("recoveryType") : null;
            if (recoveryType === "forgot-username") {
                // This is the last step for forgot username
                alert("Username recovery complete! Please check your email.");
                // Optionally, redirect to login or home
                router.push("/auth/log-in");
            } else {
                // Continue to next step for forgot password
                router.push("/auth/account-recovery-3");
            }
        } else {
          alert("Please enter a valid 4-digit code.");
        }
      };

    return {
        codeSegments,
        handleCodeChange,
        fullCode,
        handleCancel,
        handleVerify,
    };
}