"use client";
import { useState, useEffect } from "react";
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faCalendar } from "@fortawesome/free-solid-svg-icons";
import StatusDropdown from "../StatusDropdown";


{/* IMAGES */}
const MoldifyLogov2 = '/assets/moldify-logo-v3.svg';

interface Mycologist {
  name: string;
  status: "available" | "at-capacity";
  cases: number;
  id?: string; // Add ID for assignment
}

interface AssignCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string; // Add case ID for assignment
  mycologists?: Mycologist[]; // Make optional since we'll fetch from backend
  onAssign?: (mycologist: Mycologist, endDate: Date | null) => void; 
}

const CAPACITY_THRESHOLD = 2; // Mycologists with >2 active cases are at capacity

export default function AssignCaseModal({ isOpen, onClose, caseId, mycologists: propMycologists, onAssign }: AssignCaseModalProps) {
  const [selectedMycologist, setSelectedMycologist] = useState<Mycologist | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "at-capacity">("all");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endDateError, setEndDateError] = useState<string>("");
  const [mycologists, setMycologists] = useState<Mycologist[]>(propMycologists || []);
  const [loading, setLoading] = useState(false);

  // Calculate minimum working date (3 working days from today)
  const getMinimumWorkingDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let workingDaysCount = 0;
    let checkDate = new Date(today);

    while (workingDaysCount < 3) {
      checkDate.setDate(checkDate.getDate() + 1);
      const dayOfWeek = checkDate.getDay();
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDaysCount++;
      }
    }

    return checkDate;
  };

  // Check if a date is a weekend
  const isWeekend = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Handle end date change with validation
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDateError("");
    const value = e.target.value;

    if (!value) {
      setEndDate(null);
      return;
    }

    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);
    const minDate = getMinimumWorkingDate();

    // Validate date is not in past and is at least 3 working days away
    if (selectedDate < minDate) {
      setEndDateError("End date must be at least 3 working days from today");
      setEndDate(null);
      return;
    }

    // Validate date is not a weekend
    if (isWeekend(selectedDate)) {
      setEndDateError("End date cannot fall on a weekend (Saturday or Sunday)");
      setEndDate(null);
      return;
    }

    setEndDate(selectedDate);
  };


  // Fetch mycologists and current workload counts when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all mycologists
        const mycologistsRes = await fetch('/api/v1/users/mycologists', { cache: 'no-store' });
        
        if (!mycologistsRes.ok) {
          throw new Error(`Failed to fetch mycologists: ${mycologistsRes.status}`);
        }

        const mycologistsText = await mycologistsRes.text();
        const mycologistsBody = mycologistsText ? JSON.parse(mycologistsText) : { success: false, data: null };
        
        console.log('🔍 Mycologists response:', mycologistsBody);

        if (mycologistsBody.success) {
          const mycologistsList = mycologistsBody.data.snapshot || [];
          console.log('🔍 Mycologists list:', mycologistsList);

          const caseCounts: Record<string, number> = {};
          await Promise.all(
            mycologistsList.map(async (m: any) => {
              const userId = m.id || m.user?.id;
              if (!userId) return;

              try {
                const countRes = await fetch(
                  `/api/v1/mold-reports/assigned/count?id=${encodeURIComponent(userId)}`,
                  { cache: 'no-store' },
                );

                if (!countRes.ok) {
                  caseCounts[userId] = 0;
                  return;
                }

                const countBody = await countRes.json();
                caseCounts[userId] = Number(countBody?.data?.total ?? 0);
              } catch (countErr) {
                console.warn('Failed to fetch assigned count for mycologist:', userId, countErr);
                caseCounts[userId] = 0;
              }
            }),
          );

          console.log('📊 Assigned active report counts per mycologist:', caseCounts);

          // Transform mycologists with case counts and status
          const transformedMycologists: Mycologist[] = mycologistsList.map((m: any) => {
            const userId = m.id || m.user?.id;
            const cases = caseCounts[userId] || 0;
            const status = cases > CAPACITY_THRESHOLD ? "at-capacity" : "available";
            
            return {
              name: m.details?.displayName || m.user?.username || "Unknown",
              status,
              cases,
              id: userId, // Keep ID for later use
            };
          });

          transformedMycologists.sort((a, b) => {
            if (a.status !== b.status) {
              return a.status === 'at-capacity' ? -1 : 1;
            }
            return b.cases - a.cases;
          });

          setMycologists(transformedMycologists);
        }
      } catch (error) {
        console.error('Failed to load mycologists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredMycologists = mycologists.filter((m) => 
    filter === "all" ? true : (filter === "available" ? m.status === "available" : m.status === "at-capacity")
  );
   const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 Modal - Selected mycologist:", selectedMycologist);
    console.log("🔍 Modal - End date:", endDate);

    if (!selectedMycologist) {
      setEndDateError("Please select a mycologist");
      return;
    }

    if (!endDate) {
      setEndDateError("End date is required");
      return;
    }

    if (onAssign) {
      onAssign(selectedMycologist, endDate);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 overflow-hidden">
      <form
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
                className="absolute top-5 right-3 text-[var(--moldify-red)] text-xl leading-none hover:scale-110 transition cursor-pointer font-black"
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
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-[var(--moldify-grey)] text-sm font-[family-name:var(--font-bricolage-grotesque)]">Loading mycologists...</p>
          </div>
        ) : (
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
        )}

        {/* Mycologist dropdown */}
        <div className="mb-7">
          <div className="flex items-center gap-2">
            <div className="flex-[3]">
              <StatusDropdown
                placeholder="Choose Mycologist"
                backgroundColor="var(--background-color)"
                textColor="var(--primary-color)"
                borderColor="var(--primary-color)"
                selectedValue={selectedMycologist?.id || selectedMycologist?.name}
                options={filteredMycologists.map((m) => ({
                  label: `${m.name} (${m.cases} cases)`,
                  value: m.id || m.name,
                  variant: m.status === "at-capacity" ? "danger" : "default"
                }))}
                onSelect={(value) => {
                  const m = filteredMycologists.find(m => (m.id || m.name) === value);
                  console.log('🔍 Selected mycologist:', m);
                  setSelectedMycologist(m || null);
                }}
              />
            </div>

            {/* Filter button */}
            <div className="flex-2">
              <StatusDropdown
                placeholder="Filter"
                backgroundColor="var(--background-color)"
                textColor="var(--primary-color)"
                borderColor="var(--primary-color)"
                selectedValue={filter}
                options={[
                  { label: "All", value: "all" },
                  { label: "Available", value: "available" },
                  { label: "At Capacity", value: "at-capacity", variant: "danger" }
                ]}
                onSelect={(value) => {
                  console.log('🔍 Selected filter:', value);
                  setFilter(value as any);
                }}
              />
            </div>
          </div>
          {!selectedMycologist && <p className="text-xs text-red-500 mt-1 font-[family-name:var(--font-bricolage-grotesque)]">* Please select a mycologist</p>}
        </div>

        {/* End Date */}
        <div className="mb-7">
          <label htmlFor="endDate" className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-semibold text-[var(--primary-color)] mb-2">Set End Date:</label>
            <div className="relative w-full">
            <input
                id="endDate"
                type="date"
                value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                onChange={handleEndDateChange}
                min={getMinimumWorkingDate().toISOString().slice(0, 10)}
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
            {endDateError && <p className="text-xs text-red-500 mt-1 font-[family-name:var(--font-bricolage-grotesque)]">* {endDateError}</p>}
        </div>
        <button
          type="submit"
          className="w-full cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-bold py-3 rounded-xl hover:bg-[var(--hover-primary)] transition mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedMycologist || !endDate}
        >
          Assign Case
        </button>
      </form>
    </div>
  );
}
