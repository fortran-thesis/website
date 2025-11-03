"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function StatisticsTile({ icon, iconColor, title, statNum }: { icon: any; iconColor: string; title: string, statNum: number }) {
    return (
        <div className = "bg-[var(--taupe)] rounded-xl p-5 w-full">
            <div className="flex flex-row items-center gap-4">
                <div className = "bg-[var(--background-color)] p-5 rounded-xl">
                    <FontAwesomeIcon
                        icon={icon}
                        style={{ width: "1.5rem", height: "1.5rem", color: iconColor }}
                    />
                </div>
                <div className = "flex flex-col items-start">
                    <h2 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-4xl mb-1">
                        {statNum}
                    </h2>
                    <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-xs mb-2">{title}</p>
                </div>
            </div>
            
        </div>
    );
}