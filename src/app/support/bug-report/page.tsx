"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useBugReportUtils } from './bugReportUtils';

const BugReportImage = '/assets/bug-report-image.svg';

export default function SendFeedback (){
    const { 
        bugReport, 
        setBugReport,
        handleBugReportChange,
        handleBugReportSubmit,
        handleCancel } = useBugReportUtils();
    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            <main className="p-5 font-[family-name:var(--font-bricolage-grotesque)] flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl  gap-x-10 bg-[var(--background-color)]">
                <div className="w-full xl:w-1/2 flex flex-col">
                    {/* BUG REPORT HEADER */}
                    <p className="text-[var(--primary-color)] font-bold text-xs mb-10">Bug Report</p>
                    <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-3">
                        SUBMIT BUG&nbsp; 
                        <span className = "inline-block xl:block">REPORT</span>
                    </h1>
                    <p className="text-[var(--moldify-black)] font-regular text-sm mb-20">Encountering app issues or errors? Report them now!</p>
                    <form onSubmit={handleBugReportSubmit} className="flex flex-col" method="POST">
                        <label htmlFor = "bugReport" className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold my-1">Describe what happened, and what you expected instead.</label>
                        {/* Bug Report Textarea */}
                        <textarea
                            id = "bugReport"
                            placeholder="Enter your bug report here..."
                            className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none h-32 resize-none"
                            required
                            value={bugReport}
                            onChange={e => setBugReport(e.target.value)}
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
                        <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-20">
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
                                {/* Send Code Button */}
                                <button
                                type="submit"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-lg hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition"
                                >
                                Send Bug Report
                                </button> 
                            </div>
                        </div>
                    </form>
                </div>
                <div className="hidden relative w-1/2 xl:flex">
                    <Image
                        src={BugReportImage}
                        alt="Send Feedback Illustration"
                        fill
                        className="object-cover rounded-xl"
                    />
                </div>
            </main>
        </div>
    )
}