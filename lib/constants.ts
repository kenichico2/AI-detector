import type { Classification } from "@/types";

/** 判定閾値 */
export const THRESHOLDS = {
  AI_MIN: 0.75,
  MIXED_MIN: 0.4,
} as const;

/** スコアから分類を判定 */
export function classify(prob: number): Classification {
  if (prob >= THRESHOLDS.AI_MIN) return "ai";
  if (prob >= THRESHOLDS.MIXED_MIN) return "mixed";
  return "human";
}

/** GPTZero と統計の重み */
export const WEIGHTS = {
  GPTZERO: 0.7,
  STATISTICAL: 0.3,
} as const;

/** 段落の最小文字数（これ未満はスキップ） */
export const MIN_PARAGRAPH_LENGTH = 50;

/** 色の定義 */
export const COLORS: Record<
  Classification,
  { bg: string; border: string; text: string; badge: string }
> = {
  human: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-800",
    badge: "bg-green-100 text-green-800",
  },
  mixed: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-800",
    badge: "bg-yellow-100 text-yellow-800",
  },
  ai: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    badge: "bg-red-100 text-red-800",
  },
  skipped: {
    bg: "bg-gray-50",
    border: "border-gray-300",
    text: "text-gray-500",
    badge: "bg-gray-100 text-gray-500",
  },
};

/** 日本語ラベル */
export const LABELS: Record<Classification, string> = {
  human: "人間が書いた可能性が高い",
  mixed: "判定が混在",
  ai: "AIが生成した可能性が高い",
  skipped: "分析するには短すぎます",
};
