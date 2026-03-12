export const CATEGORY_COLORS = {
  seo:   { hex: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)"  },
  aeo:   { hex: "#a855f7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.3)"  },
  geo:   { hex: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.3)"   },
  trust: { hex: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
} as const;

export type CategoryKey = keyof typeof CATEGORY_COLORS;
