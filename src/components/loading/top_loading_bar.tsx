"use client";

interface TopLoadingBarProps {
  isVisible?: boolean;
}

export default function TopLoadingBar({ isVisible = true }: TopLoadingBarProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
      <div
        className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]"
        style={{ width: "30%" }}
      />
    </div>
  );
}
