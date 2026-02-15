export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-[#262626] bg-gray-100 dark:bg-[#0f0f0f] px-6 py-3 text-[10px] text-gray-400 dark:text-[#444] flex justify-between uppercase tracking-widest font-bold font-mono transition-colors">
      <div>
          v{__APP_VERSION__} • <a href="https://github.com/mafarit/go-sentinel" target="_blank" rel="noreferrer" className="hover:text-[#2f855a] transition-colors">Go-Sentinel</a>
      </div>
    </footer>
  );
}
