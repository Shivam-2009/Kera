import { useState, useMemo } from "react";
import { characters, Tag, Character } from "@/data/characters";
import { useTheme } from "@/hooks/useTheme";
import CharacterCard from "@/components/CharacterCard";
import CharacterDetailsDialog from "@/components/CharacterDetailsDialog";
import TagFilter from "@/components/TagFilter";
import SafeToggle from "@/components/SafeToggle";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ChatView from "@/components/ChatView";
import { Search, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const CHARS_PER_PAGE = 16;

type FilterMode = "family" | "mature" | "both";

export default function Index() {
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<FilterMode>("family"); // family, mature, or both
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [chatCharId, setChatCharId] = useState<string | null>(null);
  const [detailedChar, setDetailedChar] = useState<Character | null>(null);
  const [page, setPage] = useState(1);
  const [showTerms, setShowTerms] = useState(false);

  const toggleFilterMode = () => {
    setMode((prev) => {
      if (prev === "family") return "mature";
      if (prev === "mature") return "both";
      return "family";
    });
    setPage(1);
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      // Filter based on mode:
      // family = only safeOnly characters
      // mature = only non-safeOnly characters
      // both = all characters
      if (mode === "family" && !c.safeOnly) return false;
      if (mode === "mature" && c.safeOnly) return false;
      
      if (selectedTags.length > 0 && !selectedTags.every((t) => c.tags.includes(t))) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q))
        );
      }
      return true;
    });
  }, [mode, selectedTags, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CHARS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * CHARS_PER_PAGE, currentPage * CHARS_PER_PAGE);

  const chatCharacter = chatCharId ? characters.find((c) => c.id === chatCharId) : null;

  if (chatCharacter) {
    return <ChatView character={chatCharacter} onBack={() => setChatCharId(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1
                className="text-xl font-black tracking-wider text-foreground text-glow sm:text-2xl"
                style={{ fontFamily: "var(--font-heading)", lineHeight: 1.1 }}
              >
                KERA AI
              </h1>
            </div>
            <span className="text-[10px] tracking-wide text-muted-foreground/60 pl-8">by pixaluniqx</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <SafeToggle mode={mode} onToggle={toggleFilterMode} />
            <ThemeSwitcher current={theme} onChange={setTheme} />
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Search */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search characters..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </motion.div>

        {/* Tags */}
        <div className="mb-8">
          <TagFilter selected={selectedTags} onToggle={toggleTag} />
        </div>

        {/* Hobby Project Note */}
        <motion.div
          className="mb-10 rounded-xl border border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5 sm:px-7 sm:py-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-sm leading-relaxed text-foreground/80 sm:text-base">
            <span className="font-semibold text-primary">Welcome to KERA AI!</span> This is a passionate hobby project created for fun and exploration. We've crafted this collection of AI companions with love and creativity, but please keep in mind this isn't a commercial or enterprise-level platform. Think of it as a personal creative endeavor where we experiment and learn together. We hope you enjoy meeting these unique characters and have a great time exploring! 🌟
          </p>
        </motion.div>

        {/* Character Grid - First half */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
          {paged.slice(0, 8).map((char, i) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: Math.min(i * 0.08, 0.4), ease: [0.16, 1, 0.3, 1] }}
            >
              <CharacterCard
                character={char}
                onClick={() => setChatCharId(char.id)}
                onInfoClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDetailedChar(char);
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Ad Space - Between character rows */}
        <div className="my-6 rounded-xl border border-dashed border-border bg-muted/50 px-6 py-5 text-center">
          <p className="text-sm font-medium text-muted-foreground">Advertisement Space</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Place your ad code here</p>
        </div>

        {/* Character Grid - Second half */}
        {paged.length > 8 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
            {paged.slice(8).map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: Math.min(i * 0.08, 0.4), ease: [0.16, 1, 0.3, 1] }}
              >
                <CharacterCard
                  character={char}
                  onClick={() => setChatCharId(char.id)}
                  onInfoClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDetailedChar(char);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <motion.div
            className="flex flex-col items-center gap-3 py-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg font-semibold text-muted-foreground">No characters found</p>
            <p className="text-sm text-muted-foreground">Try different tags or search terms</p>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  n === currentPage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Ad Spaces - Side by side */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-dashed border-border bg-muted/50 px-6 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">Ad Space</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Square ad placement</p>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-muted/50 px-6 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">Ad Space</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Square ad placement</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-muted/30 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                © 2026 KERA AI. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                by pixaluniqx
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="mailto:iamshivamsaini7@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
              <button
                onClick={() => setShowTerms(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-slate-800 p-6 text-left shadow-2xl border border-slate-700">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Terms and Conditions</h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <h4 className="mb-2 font-semibold text-white">1. Acceptance of Terms</h4>
                <p>By accessing and using this website, you agree to comply with these Terms and Conditions.</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">2. Use of Service</h4>
                <p>You agree to use this website only for lawful purposes. You must not misuse, disrupt, or attempt to harm the service. Users must be 18+.</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">3. AI-Generated Content</h4>
                <p>This website uses AI to generate responses. Content may not always be accurate, appropriate, or reliable. Use at your own discretion. All characters are 18+.</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">4. User Responsibility</h4>
                <p>You are responsible for the content you input. Do not submit harmful, illegal, or abusive material.</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">5. Limitation of Liability</h4>
                <p>We are not responsible for any damages, losses, or issues resulting from the use of this website or AI-generated content.</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">6. Privacy</h4>
                <p>We may collect basic usage data to improve the service. By using this website, you agree to such data collection.</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">7. Modifications</h4>
                <p>We reserve the right to update or change these Terms at any time without prior notice.</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">8. Termination</h4>
                <p>We may restrict or terminate access to the service if users violate these terms.</p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-white">9. Contact</h4>
                <p>For any questions, please contact us at: <a href="mailto:iamshivamsaini7@gmail.com" className="text-blue-400 hover:text-blue-300">iamshivamsaini7@gmail.com</a></p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Details Dialog */}
      <CharacterDetailsDialog
        character={detailedChar}
        isOpen={detailedChar !== null}
        onClose={() => setDetailedChar(null)}
      />
    </div>
  );
}
