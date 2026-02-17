export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-3 text-[10px] text-muted-foreground flex justify-between uppercase tracking-widest font-bold font-mono">
      <div>
          v{__APP_VERSION__} • <a href="https://github.com/mafarit/go-sentinel" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Go-Sentinel</a>
      </div>
    </footer>
  );
}
