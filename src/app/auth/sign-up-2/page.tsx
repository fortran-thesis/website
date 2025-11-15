"use client";
import Link from 'next/link';
import StepIndicator from "@/components/step_indicator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faPen, faPlus, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import Image from "next/image";
import { useSignUp2Utils } from './signUp2Utils';

const LogInImage = '/assets/LogIn_Image.svg';

/// This is the second step for signing up as a Mold Curator in Moldify
/// It asks the user to enter their personal information

export default function Page() {
    const {
        file,
        progress,
        fileInputRef,
        links,
        addLink,
        updateLink,
        removeLink,
        handleFileChange,
        removeFile,
        handleCancelButton,
        handleCreateAcc,
    } = useSignUp2Utils();

    return (
        <div className="bg-[var(--taupe)] min-h-screen w-full p-10 xl:p-20 flex flex-col items-center justify-center">
            <main className="flex flex-grow xl:flex-row w-full sm:w-4/5 max-w-[1200px] shadow-lg rounded-xl gap-x-10 bg-[var(--background-color)]">
                {/* TEMPORARY IMAGE FOR SIGN UP!!! */}
                <div className="hidden relative w-1/2 xl:flex transform scale-x-[-1]">
                    <Image
                        src={LogInImage}
                        alt="Log In Illustration"
                        fill
                        className="object-cover rounded-xl"
                    />
                </div>
                <div className="w-full xl:w-1/2 p-5 flex flex-col mt-0 xl:mt-2 max-h-auto xl:max-h-150 overflow-y-auto">
                    {/* SIGN UP HEADER*/}
                    <StepIndicator length={2} currentStep={2} />
                    <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] mt-2">LET&apos;S SET UP YOUR
                        <span className="inline xl:block text-[var(--accent-color)]"> ACCOUNT</span>
                    </h1>

                    {/* SIGN UP FORM - PART 2*/}
                    <form className = "mt-8 flex flex-col" method = "POST">
                        <label className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-5">Upload PDF of certificate or CV proving mycology expertise.</label>
                        <div className="relative rounded-lg h-32 w-full bg-[var(--taupe)] flex flex-col items-center justify-center mt-1 px-5">
                            <FontAwesomeIcon icon={faFilePdf} className="text-[var(--accent-color)]" style={{ width: '3rem', height: '3rem' }} />
                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                id="file-upload"
                                required
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            {/* Pencil button */}
                            <label htmlFor="file-upload" className="absolute bottom-2 right-2 cursor-pointer">
                                <span className="bg-[var(--background-color)] text-[var(--accent-color)] rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/5">
                                    <FontAwesomeIcon icon={faPen} />
                                </span>
                            </label>
                        </div>
                        {/* File preview/progress bar at the bottom
                        This is the container when user uploads a file */}
                        {file && (
                            <div className="w-full flex items-center gap-4 bg-[var(--taupe)] p-2 rounded-lg relative mt-2">
                                <FontAwesomeIcon icon={faFilePdf} className="text-[var(--accent-color)]" style={{ width: '2rem', height: '2rem' }} />
                                <div className="flex-1">
                                    <div className="flex flex-col justify-between text-sm">
                                        <span className = "font-[family-name:var(--font-montserrat)] text-sm font-extrabold text-[var(--primary-color)] mt-1">{file.name}</span>
                                        <span className = "font-[family-name:var(--font-bricolage-grotesque)] text-xs font-extralight text-[var(--moldify-grey)]">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative h-1.5 w-full bg-[var(--background-color)] rounded-lg">
                                            <div
                                                className="absolute left-0 top-0 h-1.5 bg-[var(--accent-color)] rounded-lg"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="font-[family-name:var(--font-bricolage-grotesque)] text-xs text-[var(--moldify-black)]">{progress}%</div>
                                    </div>
                                </div>
                                {/* Remove file button */}
                                <button
                                    className="cursor-pointer ml-2 text-[var(--moldify-red)] font-bold text-lg absolute top-2 right-2 hover:text-red-700"
                                    onClick={removeFile}
                                    aria-label="Remove file"
                                    type="button"
                                    >
                                    ×
                                </button>
                            </div>
                        )}
                        <label className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-semibold mt-5">Linkedin/Credly/Other Relevant Links:</label>
                            <div className="flex flex-col">
                                {/* Link Textboxes */}
                                {links.map((link, idx) => (
                                    <div key={idx} className="relative mt-1">
                                        <input
                                            type="url"
                                            placeholder="Enter link"
                                            className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 pr-8 rounded-lg focus:outline-none w-full"
                                            required={idx === 0}
                                            value={link}
                                            onChange={e => updateLink(idx, e.target.value)}
                                        />
                                        {/* Remove Link Button
                                        If textbox is more than 1 (0), the remove button will appear on the 2nd textbox */}
                                        {idx > 0 && (
                                            <button
                                                type="button"
                                                className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-[var(--moldify-red)] hover:text-red-700 text-lg"
                                                onClick={() => removeLink(idx)}
                                                aria-label="Remove link"
                                            >
                                                <FontAwesomeIcon icon={faCircleMinus} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                        {/* Add Link Button */}
                        <label
                            className="ml-1 text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-xs font-semibold hover:text-[var(--hover-primary)] cursor-pointer flex justify-end mt-1"
                            onClick={addLink}
                            style={{ userSelect: 'none' }}
                        >
                            Add More Link
                            <FontAwesomeIcon icon={faPlus} className="ml-1" />
                        </label>

                        {/* Checkbox for agreeing to the terms and policy */}
                        <label className="flex items-start gap-2 my-4 text-xs text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] text-center sm:text-left">
                            <input
                                type="checkbox"
                                required
                                className="scale-110 mt-0.5 cursor-pointer accent-[var(--primary-color)]"
                            />
                            <span>
                                I acknowledge that I have read, understood and agree to Moldify’s&nbsp;
                                <Link
                                href="/terms"
                                className="text-[var(--accent-color)] font-semibold hover:underline"
                                >
                                Terms of Use
                                </Link>
                                &nbsp;and&nbsp;
                                <Link
                                href="/terms"
                                className="text-[var(--accent-color)] font-semibold hover:underline"
                                >
                                Privacy Policy
                                </Link>.
                            </span>
                        </label>
                        <div className = "flex flex-col xl:flex-row gap-x-5 gap-y-5 mt-10">
                            <div className = "flex flex-col flex-1">
                                {/* Cancel Button */}
                                <button
                                type="button"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--background-color)] text-[var(--primary-color)] font-bold py-2 rounded-lg border-3 border-[var(--primary-color)] hover:bg-black/10 transition"
                                onClick={handleCancelButton}
                                >
                                Cancel
                                </button>  
                            </div>
                            <div className="flex flex-col flex-1">
                                {/* Create Account Button */}
                                <button
                                type="submit"
                                className="cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-2 border-3 border-[var(--primary-color)] rounded-lg hover:bg-[var(--hover-primary)] hover:border-[var(--hover-primary)] transition"
                                onClick={handleCreateAcc}
                                >
                                Create Account
                                </button> 
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}