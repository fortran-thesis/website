"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

export default function StatisticsTile({ title, statNum }: { title: string, statNum: number }) {
    return (
        <div className = "bg-[var(--taupe)] rounded-lg p-5 shadow-md w-full max-w-sm">
            <div className="flex flex-row justify-between items-center relative group">
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] text-sm mb-2">
                    {title}
                </p>
                <div className="relative flex items-center">
                    <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="text-[var(--moldify-grey)] cursor-pointer"
                        style={{ width: '16px', height: '16px' }}
                    />
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[var(--moldify-grey)] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        More info about {title}
                    </span>
                </div>
            </div>

            <p className = "font-[family-name:var(--font-montserrat)] text-[var(--moldify-black)] font-black text-3xl">
                {statNum}
            </p>
        </div>
    );
}