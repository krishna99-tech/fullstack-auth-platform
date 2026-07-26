export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center w-24 h-24 mb-4">
        <svg className="absolute inset-0 w-full h-full animate-spin-slow text-blue-500/20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="60 120" strokeLinecap="round" />
        </svg>
        <svg className="absolute inset-0 w-full h-full animate-spin-reverse-slow text-purple-500/40" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="40 80" strokeLinecap="round" />
        </svg>
        <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
      </div>
      <h2 className="text-xl font-medium tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">
        LOADING
      </h2>
    </div>
  );
}
