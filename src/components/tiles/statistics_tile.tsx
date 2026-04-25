"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function StatisticsTile({ icon, iconColor, title, statNum }: { icon: any; iconColor: string; title: string, statNum: number }) {
    return (
<div className="bg-[var(--taupe)] rounded-3xl p-6 w-full h-full min-h-[120px] shadow-sm flex items-center">
    <div className="flex flex-row items-center gap-5">
        {/* Icon Container */}
        <div className="bg-[var(--background-color)] p-4 rounded-2xl flex items-center justify-center shrink-0">
            <FontAwesomeIcon
                icon={icon}
                style={{ width: "1.25rem", height: "1.25rem", color: iconColor }}
            />
        </div>

        {/* Text Content */}
        <div className="flex flex-col justify-center min-w-0">
            <h2 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-extrabold text-3xl leading-tight">
                {statNum}
            </h2>
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium opacity-80 tracking-wide">
                {title}
            </p>
        </div>
    </div>
</div>
    );
}
