"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useSendFeedbackUtils } from './sendFeedbackUtils';

export default function SendFeedback (){
    
    const { 
        feedback, 
        setFeedback,
        handleFeedbackSubmit, 
        handleCancel } = useSendFeedbackUtils();
    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            <main className="relative overflow-hidden p-5 font-[family-name:var(--font-bricolage-grotesque)] flex h-fit xl:flex-row w-full md:max-w-1/2 max-w-full shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
                <div className="w-full flex flex-col z-10">
                    {/* SEND FEEDBACK HEADER */}
                    <p className="text-[var(--primary-color)] font-bold text-xs mb-10">Send Feedback</p>
                    <div className="flex flex-col items-center justify-center mb-10">
                        <h1 className="font-[family-name:var(--font-montserrat)] font-black text-4xl text-[var(--primary-color)] text-center">
                            SEND FEEDBACK 
                        </h1>
                        <p className="text-[var(--moldify-black)] font-regular text-center text-sm">
                           Feature or improvement ideas? Share your feedback today.
                        </p>
                    </div>
                    <form onSubmit={handleFeedbackSubmit} className="flex flex-col" method="POST">
                        <label htmlFor = "feedback" className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">How can we make our app better?</label>
                        {/* Feedback Textarea */}
                        <textarea
                            id = "feedback"
                            placeholder="Enter your feedback here..."
                            className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none h-32 resize-none"
                            required
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        />
                        <p className="text-xs text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] mt-2 text-center">
                            Submitting this form indicates your agreement to Moldify’s data processing as stated in our&nbsp;
                            <Link
                                href="/terms"
                                className="text-[var(--primary-color)] font-bold hover:underline"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                        <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-20 mb-30">
                            <div className = "flex flex-col flex-1">
                                {/* Cancel Button */}
                                <button
                                type="button"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-full border-3 border-[var(--primary-color)] hover:bg-black/10 transition"
                                onClick={handleCancel}
                                >
                                Cancel
                                </button>  
                            </div>
                            <div className="flex flex-col flex-1">
                                {/* Send Code Button */}
                                <button
                                type="submit"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-full hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                Send Feedback
                                </button> 
                            </div>
                        </div>
                    </form>
                </div>
                {/* GRASS IMAGE AT THE BOTTOM OF THE CONTAINER */}
                <div className="absolute -bottom-10 md:-bottom-5 lg:-bottom-10 xl:-bottom-18 left-0 w-full leading-[0] pointer-events-none">
                    <Image 
                        src="/assets/grass.png" 
                        alt="Grass decoration" 
                        width={800} 
                        height={100} 
                        className="w-full h-auto object-cover opacity-90"
                    />
                </div>
            </main>
        </div>
    )
}