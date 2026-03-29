import { Tag, ALL_TAGS } from "@/data/characters";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const INITIAL_VISIBLE = 8;

interface Props {
  selected: Tag[];
  onToggle: (tag: Tag) => void;
}

export default function TagFilter({ selected, onToggle }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visibleTags = showAll ? ALL_TAGS : ALL_TAGS.slice(0, INITIAL_VISIBLE);
  const hasMore = ALL_TAGS.length > INITIAL_VISIBLE;

  return (
    <motion.div
      className="flex flex-wrap items-center gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {visibleTags.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 active:scale-95 sm:text-sm ${
              active
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        );
      })}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 active:scale-95 sm:text-sm"
        >
          {showAll ? (
            <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>See more ({ALL_TAGS.length - INITIAL_VISIBLE}) <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>
      )}
    </motion.div>
  );
}
