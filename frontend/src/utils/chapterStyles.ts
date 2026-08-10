export type CategoryColor = {
  bg: string;
  text: string;
  dot: string;
};

const CATEGORY_PALETTE: CategoryColor[] = [
  { bg: "#eef2ff", text: "#3730a3", dot: "#6366f1" }, // indigo
  { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" }, // green
  { bg: "#fff7ed", text: "#9a3412", dot: "#f97316" }, // orange
  { bg: "#fdf4ff", text: "#6b21a8", dot: "#a855f7" }, // purple
  { bg: "#f0fdfa", text: "#115e59", dot: "#14b8a6" }, // teal
  { bg: "#fef9c3", text: "#713f12", dot: "#eab308" }, // yellow
  { bg: "#ffe4e6", text: "#9f1239", dot: "#f43f5e" }, // rose
  { bg: "#e0f2fe", text: "#075985", dot: "#0ea5e9" }, // sky
];

function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

export function getCategoryColor(category: string): CategoryColor {
  return CATEGORY_PALETTE[hashString(category) % CATEGORY_PALETTE.length];
}

/** @deprecated Use getCategoryColor instead */
export const CHAPTER_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-orange-500",
];
