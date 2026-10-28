export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="100" height="100" rx="24" fill="#1D1D1F" className="dark:fill-white" />
      <path d="M35 70V35C35 30.5817 38.5817 27 43 27H57C61.4183 27 65 30.5817 65 35V70" stroke="#FF6C37" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="55" cy="50" r="4" fill="#FF6C37" />
      <path d="M28 45H35M28 55H35M65 45H72M65 55H72" stroke="#FF6C37" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
};