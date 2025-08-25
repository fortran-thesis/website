import StepIndicator from "@/components/step_indicator";
import Image from "next/image";

const LogInImage = '/assets/LogIn_Image.svg';

export default function SignUp() {
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
                <div className="w-full xl:w-1/2 p-5 flex flex-col">
                    <StepIndicator length={2} />
                    <h1>Sign Up</h1>
                </div>
            </main>
        </div>
    );
}