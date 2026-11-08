const PATHS: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  list: "M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6",
  plus: "M12 5v14M5 12h14",
  sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  copy: "M9 9h10a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V11a2 2 0 012-2zM5 15V5a2 2 0 012-2h10",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevron: "M9 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  wallet: "M3 7a2 2 0 012-2h13v4M3 7v10a2 2 0 002 2h15V9H5a2 2 0 01-2-2zM16 14h2",
  alert: "M12 3l10 18H2zM12 10v5M12 18v.5",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z",
  lock: "M6 11V8a6 6 0 1112 0v3M5 11h14v10H5z",
  users: "M16 19v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 4a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM20 19v-1a4 4 0 00-3-3.9M16 4.2a3.5 3.5 0 010 6.6",
  building: "M4 21V5l8-2v18M12 8h8v13M8 8h1M8 12h1M8 16h1M16 12h1M16 16h1M2 21h20",
  refresh: "M20 11a8 8 0 00-14-4M4 5v4h4M4 13a8 8 0 0014 4M20 19v-4h-4",
  checkcircle: "M12 3a9 9 0 100 18 9 9 0 000-18zM8 12.5l3 3 5-6",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  undo: "M4 9h11a5 5 0 010 10H8M4 9l4-4M4 9l4 4",
};

export function Icon({
  name,
  className = "size-5",
}: {
  name: keyof typeof PATHS | string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}
