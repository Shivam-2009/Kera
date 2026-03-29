import { Character } from "@/data/characters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, Heart } from "lucide-react";

interface Props {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CharacterDetailsDialog({
  character,
  isOpen,
  onClose,
}: Props) {
  if (!character) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{character.name}</DialogTitle>
        </DialogHeader>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Character Image */}
          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-border">
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Subtitle */}
          <div>
            <p className="text-base text-muted-foreground italic">{character.subtitle}</p>
          </div>

          {/* Content Type Badge */}
          <div className="flex items-center gap-2">
            {character.safeOnly ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-700">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Family Safe
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700">
                <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Mature Content
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {character.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Personality / Prompt */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Character Prompt</h3>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {character.personality}
              </p>
            </div>
          </div>

          {/* First Message */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Opening Message</h3>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {character.firstMessage}
              </p>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
