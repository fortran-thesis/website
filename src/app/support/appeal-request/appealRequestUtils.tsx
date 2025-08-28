"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAppealRequestUtils() {
    const [appealRequest, setAppealRequest] = useState("");
    const [suspensionReason, setSuspensionReason] = useState<string | null>(null);
    const [suspensionDetails, setSuspensionDetails] = useState<string | null>(null);
    const router = useRouter();

    // This fetches the reason why the user was suspended 
    // as well as additional details provided by the platform manager
    useEffect(() => {
        async function fetchSuspensionReason() {
            try {
                const response = await fetch("/api/suspension-reason");
                if (!response.ok) throw new Error("Failed to fetch suspension reason");
                const data = await response.json();
                setSuspensionReason(typeof data === "string" ? data : JSON.stringify(data));
                setSuspensionDetails(data.additionalDetails || null);
            } catch (error) {
                setSuspensionReason("Unable to fetch suspension reason.");
                setSuspensionDetails("No additional details available.");
            }
        }
        fetchSuspensionReason();
    }, []);

    // This handles the cancel button
    const handleCancel = () => {
        if (appealRequest !== "" && confirm("Are you sure you want to cancel? You will lose all progress")) {
            setAppealRequest("");
            router.back();
        } else if (appealRequest === "") {
            router.back();
        }
    };

    // This handles the submit request button
    const handleSubmitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch("/api/appeal-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ appealRequest }),
            });
            if (!response.ok) throw new Error("Failed to submit appeal request");
            const data = await response.json();
            // Handle successful submission (show a success message thru toasts or something)
        } catch (error) {
            // Handle error (show an error message thru toasts or something)
        }
    };

    return {
        appealRequest,
        setAppealRequest,
        handleCancel,
        handleSubmitRequest,
        suspensionReason,
        suspensionDetails,
    };
}