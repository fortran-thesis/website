import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

/// This is the second sign-up step utility hook
/// It manages the state and behavior for the second step of the sign-up process

export function useSignUp2Utils() {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [links, setLinks] = useState<string[]>([""]);
    const router = useRouter();

    // Add new link textbox
    const addLink = () => setLinks(prev => [...prev, ""]);
    // Update link value
    const updateLink = (idx: number, value: string) => {
        setLinks(prev => prev.map((l, i) => i === idx ? value : l));
    };
    // Remove link textbox
    const removeLink = (idx: number) => {
        if (confirm("Are you sure you want to remove this link?")) {
            setLinks(prev => prev.filter((_, i) => i !== idx));
        }
    };

    // Simulate upload progress (for demo only!!!)
    const startUpload = () => {
        setProgress(0);
        let percent = 0;
        const interval = setInterval(() => {
            percent += 10;
            setProgress(percent);
            if (percent >= 100) clearInterval(interval);
        }, 200);
    };

    // This file handles file selection and upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);
        if (selected) startUpload();
    };

    // This function removes the selected file
    const removeFile = () => {
        if (confirm("Are you sure you want to remove this file?")) {
            setFile(null);
            setProgress(0);
            // Only set file input value to empty string to clear it. Never set to a filename.
            if (fileInputRef.current) {
                try {
                    fileInputRef.current.value = "";
                } catch (err) {
                    // Silently ignore if browser throws
                }
            }
        }
    };

    // This tracks changes made by the user in the input fields
    const hasChanges = () => {
        return file !== null || progress > 0 || links.some(link => link !== "");
    };
    
    // This handles the cancel button
    const handleCancelButton = () =>{
        if (hasChanges() && confirm ("Are you sure you want to cancel? You will lose all progress")) {
            setFile(null);
            setProgress(0);
            setLinks([""]);
            router.back();
        }
        else if (!hasChanges()) {
            setFile(null);
            setProgress(0);
            setLinks([""]);
            router.back();
        }
    }

    // This is used to expose the state and functions
    return {
        file,
        setFile,
        progress,
        setProgress,
        fileInputRef,
        links,
        setLinks,
        addLink,
        updateLink,
        removeLink,
        startUpload,
        handleFileChange,
        removeFile,
        handleCancelButton,
    };
}
