"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function appealRequestUtils() {
    const [appealRequest, setAppealRequest] = useState("");
    const [suspensionReason, setSuspensionReason] = useState<string | null>(null);
    const [suspensionDetails, setSuspensionDetails] = useState<string | null>(null);
    const router = useRouter();

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

    return {
        appealRequest,
        setAppealRequest,
        handleCancel,
        suspensionReason,
        suspensionDetails,
    };
}