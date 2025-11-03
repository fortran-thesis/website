"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb({ role }: { role: string }) {
  const pathname = usePathname();

  // Split the URL and remove empty parts
  const pathSegments = pathname.split("/").filter(Boolean);

  // Generate clickable breadcrumbs for each segment
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return { href, label };
  });

  return (
    <nav className="flex items-center text-sm text-[var(--primary-color)] font-medium flex-wrap font-[family-name:var(--font-bricolage-grotesque)]">
      {/* Moldify - not clickable */}
      <span >Moldify</span>
      <span className="mx-2">{'>'}</span>

      {/* Role - not clickable */}
      <span >{role}</span>

      {/* Path breadcrumbs */}
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center">
          <span className="mx-2">{'>'}</span>
          {index === breadcrumbs.length - 1 ? (
            <span className="font-bold">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:underline"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
