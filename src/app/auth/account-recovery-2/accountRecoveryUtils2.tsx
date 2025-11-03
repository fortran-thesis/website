"use client";
import { useState} from 'react';
import { useRouter } from 'next/navigation';

// This is a custom hook for managing the account recovery step 2 state

export function useAccountRecoveryUtils2(){

    const [codeSegments, setCodeSegments] = useState(["", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
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
      const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (fullCode.length !== 4) {
          setError("Please enter a valid 4-digit code.");
          return;
        }

        // Read email and recovery type from sessionStorage
        const email = typeof window !== "undefined" ? sessionStorage.getItem("recoveryEmail") : null;
        const recoveryType = typeof window !== "undefined" ? sessionStorage.getItem("recoveryType") : null;
        
        if (!email) {
          setError("Email not found. Please restart the recovery process.");
          return;
        }

        setIsLoading(true);

        try {
          const response = await fetch("/api/v1/auth/check-verification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code: fullCode }),
          });

          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error("Invalid response from server");
          }

          if (!response.ok) {
            throw new Error(data.message || "Failed to verify code");
          }

          // Check recovery type
          if (recoveryType === "forgot-username") {
            // Call the verified-forget-username endpoint
            const usernameResponse = await fetch("/api/v1/auth/verified-forget-username", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                email,
                token: data.token 
              }),
            });

            const usernameText = await usernameResponse.text();
            let usernameData;
            try {
              usernameData = JSON.parse(usernameText);
            } catch {
              throw new Error("Invalid response from server");
            }

            if (!usernameResponse.ok) {
              throw new Error(usernameData.message || "Failed to retrieve username");
            }

            alert("Username recovery complete! Please check your email.");
            // Clear recovery session after successful completion
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("recoveryEmail");
              sessionStorage.removeItem("recoveryType");
              sessionStorage.removeItem("recoveryToken");
            }
            router.push("/auth/log-in");
          } else {
            // Store token in sessionStorage for step 3
            if (typeof window !== "undefined") {
              sessionStorage.setItem("recoveryToken", data.token);
            }
            // Continue to step 3 with clean URL (no query params)
            router.push("/auth/account-recovery-3");
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Failed to verify code";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

    return {
        codeSegments,
        handleCodeChange,
        fullCode,
        handleCancel,
        handleVerify,
        isLoading,
        error,
    };
}