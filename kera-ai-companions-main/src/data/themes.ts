export interface Theme {
  id: string;
  name: string;
  preview: { bg: string; primary: string; secondary: string };
}

export const themes: Theme[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk Dark",
    preview: { bg: "#111827", primary: "#00ffff", secondary: "#ff0080" },
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    preview: { bg: "#0d1526", primary: "#4d8df7", secondary: "#2e8bc0" },
  },
  {
    id: "sakura",
    name: "Sakura Pink",
    preview: { bg: "#f7eef0", primary: "#d6456c", secondary: "#c26fb3" },
  },
  {
    id: "matrix",
    name: "Emerald Matrix",
    preview: { bg: "#0a1a10", primary: "#1ae85a", secondary: "#1a8a42" },
  },
  {
    id: "sunset",
    name: "Sunset Warm",
    preview: { bg: "#1a1209", primary: "#e87b1a", secondary: "#d6456c" },
  },
];
