import { themes } from "@/data/themes";
import { Palette } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  current: string;
  onChange: (id: string) => void;
}

export default function ThemeSwitcher({ current, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/50 active:scale-95"
        aria-label="Change theme"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl"
            >
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onChange(t.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                    current === t.id
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex gap-1">
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ background: t.preview.bg }}
                    />
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ background: t.preview.primary }}
                    />
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ background: t.preview.secondary }}
                    />
                  </div>
                  <span className="font-medium">{t.name}</span>
                  {current === t.id && <span className="ml-auto text-primary">✓</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
