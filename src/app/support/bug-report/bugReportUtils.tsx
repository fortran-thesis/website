"use client";
import { useState} from 'react';
import { useRouter } from 'next/navigation';

export function bugReportUtils () {
    const [bugReport, setBugReport] = useState("");
    const router = useRouter();

    const handleBugReportChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBugReport(event.target.value);
    };

    const handleBugReportSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // This handles bug report length validation
        if (!bugReport || bugReport.trim().length < 10) {
            alert("Please enter at least 10 characters of bug report.");
            return;
        }

        try {
            const response = await fetch('/api/bug-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bugReport }),
            });

            if (!response.ok) {
                throw new Error('Failed to send bug report');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // This handles the cancel button
    const handleCancel = () => {
        if (bugReport !== "" && confirm("Are you sure you want to cancel? You will lose all progress")) {
            setBugReport("");
            router.back();
        } else if (bugReport === "") {
            router.back();
        }
    };

    return {
        bugReport,
        setBugReport,
        handleBugReportChange,
        handleBugReportSubmit,
        handleCancel,
    };
}