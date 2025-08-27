"use client";
import { useState} from 'react';
import { useRouter } from 'next/navigation';

export function sendFeedbackUtils () {
    const [feedback, setFeedback] = useState("");
    const router = useRouter();

    const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFeedback(event.target.value);
    };

    const handleFeedbackSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // This handles feedback length validation
        if (!feedback || feedback.trim().length < 10) {
            alert("Please enter at least 10 characters of feedback.");
            return;
        }

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feedback }),
            });

            if (!response.ok) {
                throw new Error('Failed to send feedback');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // This handles the cancel button
    const handleCancel = () => {
        if (feedback !== "" && confirm("Are you sure you want to cancel? You will lose all progress")) {
            setFeedback("");
            router.back();
        } else if (feedback === "") {
            router.back();
        }
    };

    return {
        feedback,
        setFeedback,
        handleFeedbackChange,
        handleFeedbackSubmit,
        handleCancel,
    };
}