"use client";

import React from "react";
import StatusBox from "@/components/tiles/status_tile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UserTableProps {
  data: User[];
  onEdit?: (user: User) => void;
}

export default function UserTable({ data, onEdit }: UserTableProps) {
  return (
    <div className="min-w-full overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
        <div className="h-[600px] overflow-y-auto">
            <table className="min-w-full text-sm text-left font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
                <thead className="sticky top-0 z-10 bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
                    <tr>
                        <th className="py-3 px-6">User ID</th>
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Email</th>
                        <th className="py-3 px-6">Role</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                {data.map((user, index) => (
                    <tr
                    key={index}
                    className="border-b border-[var(--taupe)] last:border-none hover:bg-[var(--accent-color)]/10 transition-colors text-center"
                    >
                    <td className="py-3 px-6 text-[var(--moldify-black)]">{user.id}</td>
                    <td className="py-3 px-6">{user.name}</td>
                    <td className="py-3 px-6">{user.email}</td>
                    <td
                        className={`py-3 px-6 font-bold ${
                        user.role.toLowerCase() === "administrator"
                            ? "text-[var(--moldify-red)]"
                            : user.role.toLowerCase() === "mycologist"
                            ? "text-[var(--moldify-blue)]"
                            : "text-[var(--primary-color)]"
                        }`}
                    >
                        {user.role}
                    </td>
                    <td className="py-3 px-6">
                        <StatusBox status={user.status} />
                    </td>
                    <td className="py-3 px-6 text-center">
                        <button
                            onClick={() => onEdit?.(user)}
                            className="text-[var(--background-color)] bg-[var(--primary-color)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-[var(--hover-primary)]"
                            aria-label="Edit"
                        >
                            <FontAwesomeIcon icon={faPen} style={{ width: "12px", height: "12px" }} />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
      </div>
    </div>
  );
}
