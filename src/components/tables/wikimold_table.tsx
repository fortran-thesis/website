"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faBoxArchive, faBook } from "@fortawesome/free-solid-svg-icons";
import EmptyState from "../empty_state";

export interface WikiMold {
  id: string;
  title: string;
  coverImage: string;
  datePublished: string;
}

interface WikiMoldTableProps {
  data: WikiMold[];
  onEdit?: (wikimold: WikiMold) => void;
  onArchive?: (wikimold: WikiMold) => void;
  isLoading?: boolean;
  hideEdit?: boolean;
  searchEmpty?: boolean;
}

export default function WikiMoldTable({ data, onEdit, onArchive, isLoading = false, hideEdit = false, searchEmpty = false }: WikiMoldTableProps) {
  const fallbackImage = "/assets/mold.jpg";
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const handleEditClick = (wikimold: WikiMold) => {
    setNavigatingId(wikimold.id);
    onEdit?.(wikimold);
  };

  if (isLoading) {
    return (
      <div className="min-w-full overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow p-6">
        <p className="text-center text-[var(--moldify-grey)]">Loading WikiMold data...</p>
      </div>
    );
  }

  if (searchEmpty) {
    return (
      <div className="min-w-full overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
        <div className="h-[600px] flex items-center justify-center">
          <EmptyState
            icon={faBook}
            title="No WikiMold Articles Match"
            message="No WikiMold articles match your search."
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Loading Bar */}
      {navigatingId && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div 
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
            style={{ width: '30%' }}
          />
        </div>
      )}

      <div className="min-w-full overflow-x-auto rounded-xl border border-[var(--primary-color)] bg-[var(--background-color)] shadow">
        <div className="h-[600px] overflow-y-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={faBook}
              title="No WikiMold Articles"
              message="No WikiMold articles published yet. Create your first article to get started."
            />
          </div>
        ) : (
          <table className="min-w-full text-sm text-left font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)]">
            <thead className="sticky top-0 z-10 bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-montserrat)] font-extrabold text-center">
              <tr>
                <th className="py-3 px-6 text-left">WikiMold ID</th>
                <th className="py-3 px-6 text-center">Cover Image</th>
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">Date Published</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((wikimold, index) => (
                <tr
                  key={wikimold.id || index}
                  className="border-b border-[var(--taupe)] last:border-none hover:bg-[var(--accent-color)]/10 transition-colors"
                >
                  <td className="py-3 px-6 text-left text-[var(--moldify-black)]">{wikimold.id}</td>
                  
                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center">
                      <div className="w-[150px] h-[150px] rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={wikimold.coverImage || fallbackImage}
                          alt={wikimold.title}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = fallbackImage;
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-6 text-left max-w-[300px]">
                    <span className="line-clamp-2" title={wikimold.title}>
                      {wikimold.title}
                    </span>
                  </td>
                  
                  <td className="py-3 px-6 text-left">{wikimold.datePublished || 'N/A'}</td>
                  
                  <td className="py-3 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!hideEdit && (
                        <button
                          onClick={() => handleEditClick(wikimold)}
                          disabled={navigatingId === wikimold.id}
                          className={`text-[var(--background-color)] bg-[var(--primary-color)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-[var(--hover-primary)] ${
                            navigatingId === wikimold.id ? 'opacity-60 cursor-wait' : ''
                          }`}
                          aria-label="Edit"
                          title="Edit WikiMold"
                        >
                          <FontAwesomeIcon 
                            icon={faPen} 
                            className={navigatingId === wikimold.id ? 'animate-pulse' : ''}
                            style={{ width: "12px", height: "12px" }} 
                          />
                        </button>
                      )}
                      <button
                        onClick={() => onArchive?.(wikimold)}
                        className="text-[var(--background-color)] bg-[var(--moldify-blue)] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-[var(--moldify-blue)]/80"
                        aria-label="Archive"
                        title="Archive WikiMold"
                      >
                        <FontAwesomeIcon icon={faBoxArchive} style={{ width: "12px", height: "12px" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </>
  );
}
