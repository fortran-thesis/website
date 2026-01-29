"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useBugReportUtils } from './bugReportUtils';

const BugReportImage = '/assets/bug-report-image.svg';

export default function SendFeedback (){
    const { 
        bugReport, 
        setBugReport,
        handleBugReportSubmit,
        handleCancel } = useBugReportUtils();
    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            <main className="relative overflow-hidden p-5 font-[family-name:var(--font-bricolage-grotesque)] flex h-fit xl:flex-row w-full md:max-w-1/2 max-w-full shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
                <div className="w-full flex flex-col z-10">
                    {/* BUG REPORT HEADER */}
                    <p className="text-[var(--primary-color)] font-bold text-xs mb-10">Bug Report</p>
                    <div className="flex flex-col items-center justify-center mb-10">
                        <h1 className="font-[family-name:var(--font-montserrat)] font-black text-4xl text-[var(--primary-color)] text-center">
                            SUBMIT BUG REPORT 
                        </h1>
                        <p className="text-[var(--moldify-black)] font-regular text-center text-sm">
                           Encountering app issues or errors? Report them now!
                        </p>
                    </div>
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
                        <div className = "flex flex-col sm:flex-row gap-x-5 gap-y-5 mt-20 mb-30">
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