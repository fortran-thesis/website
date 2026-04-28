"use client";

import React from "react";
import StatusBox from "@/components/tiles/status_tile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faUsers } from "@fortawesome/free-solid-svg-icons";
import EmptyState from "../empty_state";

export interface User {
  id: string
  user: UserDetails;
  details: UserAuthDetails;
  mycologist_details?: MycologistDetails | null
}
export interface UserDetails {
  username: string;
  role: "user" | "farmer" | "curator" | "mycologist" | "admin" | "administrator";
  first_name: string;
  last_name: string;
  address: string;
  is_banned: boolean;
  occupation?: string;
}

export interface UserAuthDetails {
  displayName?: string;
  email?: string;
  photo_url: string;
  phone_number?: string
  disabled: boolean;
}

export interface MycologistDetails {
  user_id: string
  resume: string
  links: Array<string>
}

interface UserTableProps {
  data: User[];
  onEdit?: (user: User) => void;
}

export default function UserTable({ data, onEdit }: UserTableProps) {
    return (
        <div className="min-w-full overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
            <div className="h-[600px] overflow-y-auto">
                {data.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <EmptyState
                      icon={faUsers}
                      title="No Users Found"
                      message="No user accounts available yet."
                    />
                  </div>
                ) : (
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
                        {data.map((user, index) => {
                          const roleLower = String(user.user?.role ?? "").toLowerCase();
                          const displayRole =
                            roleLower === "user" || roleLower === "farmer"
                              ? "Client"
                              : roleLower
                              ? roleLower.charAt(0).toUpperCase() + roleLower.slice(1)
                              : "";

                          return (
                            <tr
                              key={index}
                              className="border-b border-[var(--taupe)] last:border-none hover:bg-[var(--accent-color)]/10 transition-colors text-center"
                            >
                              <td className="py-3 px-6 text-[var(--moldify-black)]">{user.id}</td>
                              <td className="py-3 px-6">{user.details?.displayName || ""}</td>
                              <td className="py-3 px-6">{user.details?.email || ""}</td>
                              <td
                                className={`py-3 px-6 font-bold ${
                                  roleLower === "administrator" || roleLower === "admin"
                                    ? "text-[var(--moldify-red)]"
                                    : roleLower === "mycologist"
                                      ? "text-[var(--moldify-blue)]"
                                      : roleLower === "user" || roleLower === "farmer"
                                        ? "text-[var(--primary-color)]"
                                        : "text-[var(--primary-color)]"
                                }`}
                              >
                                {displayRole}
                              </td>
                              <td className="py-3 px-6">
                                <StatusBox status={user.details?.disabled === false ? "Active" : "Inactive"} />
                              </td>
                              <td className="py-3 px-6 text-center">
                                <button
                                  onClick={() => onEdit?.(user)}
                                  className="text-[var(--background-color)] bg-[var(--primary-color)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-[var(--hover-primary)]"
                                  aria-label="Edit"
                                >
                                  <FontAwesomeIcon icon={faEye} style={{ width: "12px", height: "12px" }} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                </table>
                )}
            </div>
        </div>
    );
}
