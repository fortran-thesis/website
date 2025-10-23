"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Image from "next/image";

{/* IMAGES */}
const MoldifyLogov2 = "/assets/moldify-logo-v3.svg";

interface AddTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTreatmentModal({ isOpen, onClose }: AddTreatmentModalProps) {
  const [fungicides, setFungicides] = useState([{ id: Date.now(), name: "" }]);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleAddFungicide = () => {
    setFungicides([...fungicides, { id: Date.now(), name: "" }]);
  };

  const handleDeleteFungicide = (id: number) => {
    setFungicides(fungicides.filter((f) => f.id !== id));
  };

  const handleChangeFungicide = (id: number, value: string) => {
    setFungicides(fungicides.map((f) => (f.id === id ? { ...f, name: value } : f)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      fungicides: fungicides.map((f) => f.name).filter((f) => f.trim() !== ""),
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--background-color)] rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
        {/* Header */}
        <div className="flex justify-center items-center mb-4">
          <div className="flex justify-between items-center space-x-3">
            <Image
              src={MoldifyLogov2}
              alt="Moldify Logo"
              width={25}
              height={25}
              className="object-contain rounded-xl"
            />
            <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-xs">
              MOLDIFY
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-3 text-[var(--moldify-red)] hover:text-red-600 cursor-pointer font-black"
          >
            ✕
          </button>
        </div>

        <h2 className="text-2xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
          ADD TREATMENT
        </h2>
        <p className="text-[var(--moldify-black)] text-sm mb-4 font-[family-name:var(--font-bricolage-grotesque)]">
          Add the details of the treatment below.
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fungicides Section */}
            <div
                className={`
                max-h-[200px] overflow-y-auto pr-2 
                scrollbar-thin scrollbar-thumb-[var(--primary-color)] scrollbar-track-[var(--taupe)]
                `}
            >
            <label
              htmlFor="fungicides"
              className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2"
            >
              Recommended Fungicides
            </label>

            <div className="space-y-2 ">
              {fungicides.map((f, index) => (
                <div key={f.id} className="relative">
                  <input
                    id={`fungicides-${f.id}`}
                    type="text"
                    placeholder={`Fungicide ${index + 1}`}
                    value={f.name}
                    onChange={(e) => handleChangeFungicide(f.id, e.target.value)}
                    className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 pr-10 rounded-lg focus:outline-none appearance-none"
                  />
                  {/* Delete button inside the textbox (except for first one) */}
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFungicide(f.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:text-[var(--moldify-red)] transition cursor-pointer"
                      aria-label="Delete fungicide"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Fungicide Button */}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleAddFungicide}
                className="text-xs flex items-center gap-1 font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-semibold hover:underline cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3 text-[var(--primary-color)]" />
                Add Fungicide
              </button>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label
              htmlFor="additional-notes"
              className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2"
            >
              Additional Notes
            </label>
            <textarea
              id="additional-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write additional notes here..."
              className="w-full h-28 font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none appearance-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-3 rounded-lg hover:bg-[var(--hover-primary)] transition mt-5"
          >
            Add Treatment
          </button>
        </form>
      </div>
    </div>
  );
}
