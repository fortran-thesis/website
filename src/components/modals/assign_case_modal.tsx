"use client";
import { useState } from "react";
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faCalendar } from "@fortawesome/free-solid-svg-icons";


{/* IMAGES */}
const MoldifyLogov2 = '/assets/moldify-logo-v3.svg';

interface Mycologist {
  name: string;
  status: "available" | "at-capacity";
  cases: number;
}

interface AssignCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mycologists: Mycologist[];
  onAssign?: (mycologist: Mycologist, priority: string, endDate: Date | null) => void; 
}

export default function AssignCaseModal({ isOpen, onClose, mycologists, onAssign }: AssignCaseModalProps) {
  const [selectedMycologist, setSelectedMycologist] = useState<Mycologist | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "at-capacity">("all");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [endDate, setEndDate] = useState<Date | null>(null);

  if (!isOpen) return null;

  const filteredMycologists = mycologists.filter((m) => 
    filter === "all" ? true : (filter === "available" ? m.status === "available" : m.status === "at-capacity")
  );

  const priorityColor = {
    low: "bg-[var(--moldify-light-green)]",
    medium: "bg-[var(--moldify-light-yellow)]",
    high: "bg-[var(--moldify-light-red)]",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMycologist) {
      if (onAssign) {
        onAssign(selectedMycologist, priority, endDate);
      }
      
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <form
        method="post"
        action="/api/assign-case" 
        className="bg-[var(--background-color)] rounded-xl w-full max-w-md p-6 relative"
        onSubmit={handleSubmit}
      >
        <div className ="flex justify-center items-center mb-4">
            <div className = "flex justify-between items-center space-x-3">
                <Image
                src={MoldifyLogov2}
                alt="Moldify Logo"
                width={25}
                height={25}
                className="object-contain rounded-xl"
                />
                <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-xs">MOLDIFY</p>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-3 text-[var(--moldify-red)] hover:text-red-600 cursor-pointer font-black"
                >
                ✕
            </button>
        </div>

        <h2 className="text-2xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">ASSIGN CASE</h2>
        <p className="text-[var(--moldify-black)] text-sm mb-4 font-[family-name:var(--font-bricolage-grotesque)]">Delegate reports to available mycologist.</p>

        {/* Workload stats */}
        <div className = "flex items-center space-x-3 mb-3 mt-5">
            <FontAwesomeIcon
                icon={faArrowTrendUp}
                style={{ width: "1rem", height: "1rem", color: "var(--moldify-grey)" }}
            />
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-grey)] text-xs">Workload Status</p>
        </div>
        <div className="flex justify-between mb-7 text-center">
          <div>
            <h1 className="text-3xl font-black font-[family-name:var(--font-montserrat)] text-[var(--moldify-blue)]">{mycologists.length}</h1>
            <p className="text-[var(--moldify-grey)] text-sm font-[family-name:var(--font-bricolage-grotesque)]">Total Mycologists</p>
          </div>
          <div>
            <h1 className="text-3xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)]">{mycologists.filter(m => m.status === "available").length}</h1>
            <p className="text-[var(--moldify-grey)] text-sm font-[family-name:var(--font-bricolage-grotesque)]">Total Available</p>
          </div>
          <div>
            <h1 className="text-3xl font-black font-[family-name:var(--font-montserrat)] text-[var(--moldify-red)]">{mycologists.filter(m => m.status === "at-capacity").length}</h1>
            <p className="text-[var(--moldify-grey)] text-sm font-[family-name:var(--font-bricolage-grotesque)]">At Capacity</p>
          </div>
        </div>

        {/* Mycologist dropdown */}
        <div className="mb-7">
            {/* <label htmlFor="mycologist" className="text-[var(--primary-color)] text-sm font-semibold font-[family-name:var(--font-bricolage-grotesque)]">
                Choose Mycologist:
            </label> */}
          <div className="flex items-center">
            <select
              aria-label="Choose Mycologist"
              id="mycologist"
              name="mycologist"
              className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] flex-3 p-3 border-2 rounded-lg border-[var(--primary-color)] bg-[var(--background-color)] focus:outline-none cursor-pointer"
              value={selectedMycologist?.name || ""}
              onChange={(e) => {
                const m = filteredMycologists.find(m => m.name === e.target.value);
                setSelectedMycologist(m || null);
              }}
              required
            >
              <option value="">Choose Mycologist</option>
              {filteredMycologists.map((m) => (
                <option key={m.name} value={m.name} className="bg-[var(--background-color)]">
                  {m.name} ({m.cases} cases)
                </option>
              ))}
            </select>

            {/* Filter button */}
            <select
              aria-label="Filter Mycologists"
              className="ml-2 flex-1 font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] p-3 border-2 rounded-lg border-[var(--primary-color)] bg-[var(--background-color)] focus:outline-none cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >  
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="at-capacity">At Capacity</option>
            </select>
          </div>
        </div>

        {/* Priority Level */}
        <div className="mb-7 mt-2">
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2">Choose Priority Level:</p>
          <div className="w-full flex gap-2 ">
            {["low", "medium", "high"].map((level) => (
              <button
                key={level}
                type="button"
                className={`flex-1 px-4 py-2 rounded-lg font-semibold cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--moldify-black)] ${
                  priority === level ? priorityColor[level as keyof typeof priorityColor] : "bg-transparent border-2 border-[var(--moldify-softGrey)]"
                }`}
                onClick={() => setPriority(level as any)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <input type="hidden" name="priority" value={priority} />
        </div>

        {/* End Date */}
        <div className="mb-7">
          <label htmlFor="endDate" className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2">Set End Date:</label>
            <div className="relative w-full">
            <input
                id="endDate"
                type="date"
                value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                onChange={(e) =>
                setEndDate(e.target.value ? new Date(e.target.value) : null)
                }
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 pr-10 mb-1 rounded-lg focus:outline-none appearance-none
                [&::-webkit-calendar-picker-indicator]:opacity-0 
                [&::-webkit-calendar-picker-indicator]:absolute 
                [&::-webkit-calendar-picker-indicator]:right-3 
                [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                name="endDate"
                required
            />
            <FontAwesomeIcon
                icon={faCalendar}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--accent-color)] pointer-events-none"
            />
            </div>
        </div>
        <button
          type="submit"
          className="w-full cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-3 rounded-lg hover:bg-[var(--hover-primary)] transition mt-5"
        >
          Assign Case
        </button>
      </form>
    </div>
  );
}
