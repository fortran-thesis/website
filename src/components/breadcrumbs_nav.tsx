"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Breadcrumb({ role, skipSegments = [] }: { role?: string; skipSegments?: string[] }) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();

  const normalizeRole = (value: string) => {
    if (!value) return "Administrator";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const authRole = authUser?.user?.role || authUser?.role || "";
  const resolvedRole = normalizeRole(authRole || role || "Administrator");

  const pathSegments = pathname.split("/").filter(Boolean);

  const filteredSegments = pathSegments.filter(segment => !skipSegments.includes(segment));

  const breadcrumbs = filteredSegments.map((segment, index) => {
    const originalIndex = pathSegments.indexOf(segment);
    const href = "/" + pathSegments.slice(0, originalIndex + 1).join("/");
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
      <span>{resolvedRole}</span>

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
