"use client";
import { useRef, useState, useEffect } from "react";
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faCalendar } from "@fortawesome/free-solid-svg-icons";
import StatusDropdown from "../StatusDropdown";
import Holidays from "date-holidays";
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';


// IMAGES
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
const HOLIDAY_COUNTRY = process.env.NEXT_PUBLIC_HOLIDAY_COUNTRY || "PH";

const parseDateInput = (value: string): Date | null => {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AssignCaseModal({ isOpen, onClose, caseId, mycologists: propMycologists, onAssign }: AssignCaseModalProps) {
  useBodyScrollLock(isOpen);

  const endDateInputRef = useRef<HTMLInputElement>(null);
  const [selectedMycologist, setSelectedMycologist] = useState<Mycologist | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "at-capacity">("all");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endDateError, setEndDateError] = useState<string>("");
  const [mycologists, setMycologists] = useState<Mycologist[]>(propMycologists || []);
  const [loading, setLoading] = useState(false);
  const [holidayCalendar] = useState(() => new Holidays(HOLIDAY_COUNTRY));

  const getHolidayInfo = (date: Date) => {
    return holidayCalendar.isHoliday(date);
  };

  const isHoliday = (date: Date): boolean => Boolean(getHolidayInfo(date));

  const getHolidayName = (date: Date): string => {
    const holiday = getHolidayInfo(date);
    if (!holiday) return "";
    if (Array.isArray(holiday)) {
      return holiday.map((item: { name?: string }) => item.name || "holiday").join(", ");
    }
    return (holiday as { name?: string }).name || "holiday";
  };



  // Handle end date change with validation
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDateError("");
    const value = e.target.value;

    if (!value) {
      setEndDate(null);
      return;
    }

    const selectedDate = parseDateInput(value);
    if (!selectedDate) {
      setEndDateError("Invalid date selected.");
      setEndDate(null);
      return;
    }
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate date is not in the past.
    if (selectedDate < today) {
      setEndDateError("End date cannot be in the past.");
      setEndDate(null);
      return;
    }

    if (isHoliday(selectedDate)) {
      const holidayName = getHolidayName(selectedDate);
      setEndDateError(`End date cannot fall on a holiday${holidayName ? ` (${holidayName})` : ""}`);
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

    if (isHoliday(endDate)) {
      const holidayName = getHolidayName(endDate);
      setEndDateError(`End date cannot fall on a holiday${holidayName ? ` (${holidayName})` : ""}`);
      return;
    }

    if (selectedMycologist.status !== "available") {
      setEndDateError("Selected mycologist is at capacity and cannot be assigned.");
      return;
    }

    if (onAssign) {
      onAssign(selectedMycologist, endDate);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] overflow-hidden">
      <form
  className="bg-[var(--background-color)] rounded-[2.5rem] w-full max-w-md p-10 relative border border-[var(--primary-color)]/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)]"
  onSubmit={handleSubmit}
>
  {/* --- HEADER (Kept as per your original wording/logic) --- */}
  <div className="flex justify-center items-center mb-8">
    <div className="flex items-center space-x-2">
      <Image
        src={MoldifyLogov2}
        alt="Moldify Logo"
        width={25}
        height={25}
        className="object-contain rounded-xl"
      />
      <p className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold text-xs tracking-[0.2em]">MOLDIFY</p>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="absolute top-8 right-8 text-[var(--moldify-red)] text-xl leading-none hover:rotate-90 transition-all duration-300 cursor-pointer font-black"
      aria-label="Close modal"
    >
      ✕
    </button>
  </div>

  <div className="text-center mb-8">
    <h2 className="text-3xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] tracking-tighter mb-2">ASSIGN CASE</h2>
    <p className="text-[var(--moldify-black)] opacity-70 text-sm font-[family-name:var(--font-bricolage-grotesque)]">Delegate reports to available mycologist.</p>
  </div>

  {/* Workload stats */}
  <div className="mb-8">
    <div className="flex items-center space-x-3 mb-4">
      <FontAwesomeIcon
        icon={faArrowTrendUp}
        style={{ width: "0.85rem", height: "0.85rem", color: "var(--primary-color)" }}
        className="opacity-50"
      />
      <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-black uppercase tracking-[0.25em] text-[10px] opacity-50">Workload Status</p>
    </div>

    {loading ? (
      <div className="flex justify-center items-center py-10 bg-[var(--primary-color)]/[0.02] rounded-2xl border border-dashed border-[var(--primary-color)]/20">
        <p className="text-[var(--primary-color)] text-xs font-bold font-[family-name:var(--font-bricolage-grotesque)] uppercase tracking-widest opacity-40">Loading mycologists...</p>
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-[var(--primary-color)]/10 bg-[var(--primary-color)]/[0.03] shadow-sm">
        <div className="p-4 border-r border-[var(--primary-color)]/10 text-center">
          <h1 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--moldify-blue)] leading-none mb-1">{mycologists.length}</h1>
          <p className="text-[var(--primary-color)] text-[9px] font-black uppercase tracking-tight opacity-50">Total Mycologists</p>
        </div>
        <div className="p-4 border-r border-[var(--primary-color)]/10 text-center">
          <h1 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] leading-none mb-1">{mycologists.filter(m => m.status === "available").length}</h1>
          <p className="text-[var(--primary-color)] text-[9px] font-black uppercase tracking-tight opacity-50">Total Available</p>
        </div>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-black font-[family-name:var(--font-montserrat)] text-[var(--moldify-red)] leading-none mb-1">{mycologists.filter(m => m.status === "at-capacity").length}</h1>
          <p className="text-[var(--primary-color)] text-[9px] font-black uppercase tracking-tight opacity-50">At Capacity</p>
        </div>
      </div>
    )}
  </div>

  {/* Mycologist dropdown area */}
  <div className="mb-8">
    <div className="flex items-center gap-3">
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
            variant: m.status === "at-capacity" ? "danger" : "default",
            disabled: m.status === "at-capacity"
          }))}
          onSelect={(value) => {
            const m = filteredMycologists.find(m => (m.id || m.name) === value);
            if (m?.status === "at-capacity") {
              setSelectedMycologist(null);
              setEndDateError("This mycologist is at capacity and cannot be selected.");
              return;
            }
            setEndDateError("");
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
          onSelect={(value) => setFilter(value as any)}
        />
      </div>
    </div>
    {!selectedMycologist && <p className="text-[10px] text-red-600 mt-2 font-bold uppercase tracking-wider ml-1">* Please select a mycologist</p>}
  </div>

  {/* End Date Section */}
  <div className="mb-8">
    <label htmlFor="endDate" className="font-[family-name:var(--font-bricolage-grotesque)] text-[10px] font-black uppercase tracking-[0.25em] text-[var(--primary-color)] opacity-60 ml-1 mb-3 block">
      Set End Date:
    </label>
    <div
      className="relative group cursor-pointer"
      onClick={() => {
        const input = endDateInputRef.current;
        if (!input) return;
        input.focus();
        (input as unknown as { showPicker?: () => void }).showPicker?.();
      }}
    >
      <input
        id="endDate"
        ref={endDateInputRef}
        type="date"
        value={endDate ? endDate.toISOString().slice(0, 10) : ""}
        onChange={handleEndDateChange}
        min={formatDateForInput(new Date())}
        className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--primary-color)]/[0.03] border border-[var(--primary-color)]/20 py-4 px-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all appearance-none
        [&::-webkit-calendar-picker-indicator]:opacity-0
        [&::-webkit-calendar-picker-indicator]:absolute
        [&::-webkit-calendar-picker-indicator]:left-0
        [&::-webkit-calendar-picker-indicator]:top-0
        [&::-webkit-calendar-picker-indicator]:w-full
        [&::-webkit-calendar-picker-indicator]:h-full
        [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        name="endDate"
        required
      />
      <FontAwesomeIcon
        icon={faCalendar}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--primary-color)] opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none"
      />
    </div>
    {endDateError && <p className="text-[10px] text-red-600 mt-2 font-bold uppercase tracking-wider ml-1">* {endDateError}</p>}
  </div>

  <button
    type="submit"
    className="w-full cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl shadow-lg shadow-[var(--primary-color)]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
    disabled={!selectedMycologist || !endDate}
  >
    Assign Case
  </button>
</form>
    </div>
  );
}
