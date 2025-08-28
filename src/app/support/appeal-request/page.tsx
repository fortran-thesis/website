"use client";
import Link from "next/link";
import { appealRequestUtils } from "./appealRequestUtils";

export default function AppealRequestPage() {
    const { 
        appealRequest, 
        setAppealRequest, 
        handleCancel,
        suspensionReason,
        suspensionDetails,
        handleSubmitRequest
    } = appealRequestUtils();

  return (
    <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
        <main className="p-5 font-[family-name:var(--font-bricolage-grotesque)] w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl bg-[var(--background-color)]">
            {/* APPEAL REQUEST HEADER */}
            <p className="text-[var(--accent-color)] font-bold text-xs mb-10">Appeal Request</p>
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-3">
                APPEAL REQUEST
            </h1>
            <p className="text-[var(--moldify-black)] font-regular text-sm mb-10">
                You may formally appeal your account suspension for reconsideration.
            </p>
            <div className = "flex flex-col-reverse xl:flex-row gap-x-10 gap-y-10 mb-10">
                <div className="w-full xl:w-1/2 flex flex-col">
                    {/* APPEAL REQUEST FORM */}
                    <form onSubmit={handleSubmitRequest} className="flex flex-col" method="POST">
                        <label className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">Please explain why you’d like us to review your suspension.</label>
                        {/* Appeal Request Textarea */}
                        <textarea
                            placeholder="Enter your reason here..."
                            className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none h-32 resize-none"
                            required
                            value={appealRequest}
                            onChange={e => setAppealRequest(e.target.value)}
                        />
                        
                        {/* Privacy Policy */}
                        <p className="text-xs text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] mt-2 text-center">
                            Submitting this form indicates your agreement to Moldify’s data processing as stated in our&nbsp;
                            <Link
                                href="/terms"
                                className="text-[var(--accent-color)] font-semibold hover:underline"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                        <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-10 xl:mt-20">
                            <div className = "flex flex-col flex-1">
                                {/* Cancel Button */}
                                <button
                                type="button"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-lg border-3 border-[var(--primary-color)] hover:bg-black/10 transition"
                                onClick={handleCancel}
                                >
                                Cancel
                                </button>  
                            </div>
                            <div className="flex flex-col flex-1">
                                {/* Submit Request Button */}
                                <button
                                type="submit"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-lg hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition"
                                >
                                Submit Request
                                </button> 
                            </div>
                        </div>
                    </form>
                </div>
                {/* Suspension Details such as reason why they are suspended, 
                and additional details provided by the platform manager */}
                <div className="w-full xl:w-1/2 flex flex-row xl:flex-col">
                    <div className="bg-[var(--taupe)] rounded-xl py-2 px-5 h-auto xl:h-82 xl:overflow-y-auto">
                        <h1 className="font-[family-name:var(--font-montserrat)] font-black text-2xl text-[var(--primary-color)] mt-3 mb-5">Why your account has been suspended</h1>
                        <ul className="list-disc pl-6 text-sm">
                            {Array.isArray(suspensionReason)
                                ? suspensionReason.map((reason, idx) => <li key={idx}>{reason}</li>)
                                : <li>{suspensionReason}</li>
                            }
                        </ul>   
                        <div className="h-0.5 bg-[var(--moldify-grey)] w-full my-4"></div>
                        <label className ="font-bold text-[var(--primary-color)] text-xs">Additional Details</label>
                        <p className = "text-[var(--moldify-black)] text-sm text-justify">
                            {suspensionDetails}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}