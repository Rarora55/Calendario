export const DEFAULT_LABEL_COLOR = "#6b7280";

export const LABEL_COLOR_OPTIONS = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#6b7280",
] as const;

export type LabelDefinition = {
    name: string;
    color: string;
};
