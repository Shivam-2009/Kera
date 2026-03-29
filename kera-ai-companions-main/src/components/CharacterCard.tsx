import { Character } from "@/data/characters";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface Props {
  character: Character;
  onClick: () => void;
  onInfoClick?: (e: React.MouseEvent) => void;
}

export default function CharacterCard({ character, onClick, onInfoClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-[box-shadow] duration-300 hover:glow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]"
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={character.image}
          alt={character.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={onInfoClick}>
          <Info className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-2">
        <h3 className="text-sm font-bold leading-tight text-foreground sm:text-base" style={{ fontFamily: "var(--font-heading)" }}>
          {character.name}
        </h3>
        <p className="text-xs leading-snug text-muted-foreground line-clamp-2 sm:text-sm">
          {character.subtitle}
        </p>
        <div className="mt-auto flex flex-wrap gap-1 pt-1.5">
          {character.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground sm:text-xs"
            >
              {tag}
            </span>
          ))}
          {character.tags.length > 3 && (
            <span className="rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground sm:text-xs">
              +{character.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
