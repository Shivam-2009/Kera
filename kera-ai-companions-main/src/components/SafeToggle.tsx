import { ShieldCheck, ShieldAlert, Blend } from "lucide-react";

type FilterMode = "family" | "mature" | "both";

interface Props {
  mode: FilterMode;
  onToggle: () => void;
}

export default function SafeToggle({ mode, onToggle }: Props) {
  const getModeConfig = (m: FilterMode) => {
    switch (m) {
      case "family":
        return {
          label: "Family",
          icon: ShieldCheck,
          color: "text-primary",
        };
      case "mature":
        return {
          label: "Mature",
          icon: ShieldAlert,
          color: "text-secondary",
        };
      case "both":
        return {
          label: "Both",
          icon: Blend,
          color: "text-accent",
        };
    }
  };

  const config = getModeConfig(mode);
  const Icon = config.icon;

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold transition-all duration-200 hover:border-primary/50 active:scale-95"
      aria-label={`Current mode: ${mode}. Click to cycle through Family → Mature → Both`}
      title="Click to cycle: Family → Mature → Both"
    >
      <Icon className={`h-4 w-4 ${config.color}`} />
      <span className={config.color}>{config.label}</span>
    </button>
  );
}
