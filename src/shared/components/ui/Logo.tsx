export default function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* Icono SVG compacto */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#1D4ED8" />
        <path
          d="M8 22V10h3.5l5 8.2V10H20v12h-3.5l-5-8.2V22H8z"
          fill="white"
        />
        <rect x="21" y="18" width="3" height="4" rx="1" fill="#93C5FD" />
        <rect x="21" y="13" width="3" height="4" rx="1" fill="#BFDBFE" />
        <rect x="21" y="10" width="3" height="2" rx="1" fill="#DBEAFE" />
      </svg>
      {/* Texto wordmark */}
      <span className="font-bold text-gray-900 dark:text-white tracking-tight leading-none">
        Alsol<span className="text-blue-700 dark:text-blue-400">NPL</span>
      </span>
    </div>
  );
}
