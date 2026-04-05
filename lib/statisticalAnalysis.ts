import type { StatisticalResult } from "@/types";

/** AI文が多用しがちな接続詞・接続表現 */
const CONJUNCTIONS = [
  "また",
  "さらに",
  "一方で",
  "しかし",
  "そのため",
  "したがって",
  "つまり",
  "すなわち",
  "加えて",
  "それに加えて",
  "具体的には",
  "例えば",
  "このように",
  "以上のことから",
  "結果として",
  "特に",
  "なお",
  "ただし",
  "もっとも",
  "それゆえ",
];

/**
 * テキストを文に分割する（日本語対応）。
 * 句点「。」「！」「？」や改行で区切る。
 */
function splitSentences(text: string): string[] {
  return text
    .split(/[。！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * テキストを形態素風にトークン化する（簡易版）。
 * 日本語は文字単位のbi-gram、英数字は空白区切り。
 */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  // 英数字の単語を抽出
  const words = text.match(/[a-zA-Z0-9]+/g);
  if (words) tokens.push(...words);
  // 日本語部分: ひらがな・カタカナ・漢字の2文字gram
  const japanese = text.replace(/[a-zA-Z0-9\s\p{P}]/gu, "");
  for (let i = 0; i < japanese.length - 1; i++) {
    tokens.push(japanese.slice(i, i + 2));
  }
  return tokens;
}

/** 標準偏差を計算 */
function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sq = values.reduce((sum, v) => sum + (v - mean) ** 2, 0);
  return Math.sqrt(sq / values.length);
}

/**
 * 1. 文の長さの均一性
 *    AI生成文は文の長さが均一になりがち。
 *    標準偏差が小さい → AIの可能性が高い。
 *    スコア: 0.0(均一でない=人間的) ~ 1.0(均一=AI的)
 */
function analyzeSentenceLengthUniformity(sentences: string[]): number {
  if (sentences.length < 2) return 0.5;
  const lengths = sentences.map((s) => s.length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) return 0.5;
  const cv = stddev(lengths) / mean; // 変動係数
  // CV が低い → 均一 → AI的。CV=0 → score=1, CV>=0.8 → score=0
  return Math.max(0, Math.min(1, 1 - cv / 0.8));
}

/**
 * 2. 語彙の多様性 (TTR)
 *    AI文は語彙が平均的（TTRが中程度）。
 *    人間は極端に高い or 低いTTRになることがある。
 *    AI的なTTR: 0.4~0.6付近 → スコアが高くなる
 */
function analyzeVocabularyDiversity(text: string): number {
  const tokens = tokenize(text);
  if (tokens.length < 10) return 0.5;
  const unique = new Set(tokens);
  const ttr = unique.size / tokens.length;
  // TTRが0.45~0.55付近（AI的な範囲）→ スコア高
  const distance = Math.abs(ttr - 0.5);
  return Math.max(0, Math.min(1, 1 - distance / 0.35));
}

/**
 * 3. 接続詞の出現頻度
 *    AI文は接続詞を多用する傾向。
 *    文あたりの接続詞数で判定。
 */
function analyzeConjunctionFrequency(
  text: string,
  sentences: string[]
): number {
  if (sentences.length === 0) return 0.5;
  let count = 0;
  for (const conj of CONJUNCTIONS) {
    const regex = new RegExp(conj, "g");
    const matches = text.match(regex);
    if (matches) count += matches.length;
  }
  const rate = count / sentences.length;
  // rate >= 0.5 → ほぼ毎文に接続詞 → AI的
  return Math.max(0, Math.min(1, rate / 0.5));
}

/**
 * 4. 句読点パターンの規則性
 *    AI文は「、」の配置が規則的（等間隔）になりやすい。
 */
function analyzePunctuationRegularity(text: string): number {
  const commaPositions: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "、" || text[i] === "，") {
      commaPositions.push(i);
    }
  }
  if (commaPositions.length < 3) return 0.5;

  // コンマ間の距離
  const gaps: number[] = [];
  for (let i = 1; i < commaPositions.length; i++) {
    gaps.push(commaPositions[i] - commaPositions[i - 1]);
  }
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  if (mean === 0) return 0.5;
  const cv = stddev(gaps) / mean;
  // CV が低い → 規則的 → AI的
  return Math.max(0, Math.min(1, 1 - cv / 0.8));
}

/**
 * テキストの統計分析を実行し、各指標と総合スコアを返す。
 */
export function analyzeStatistically(text: string): StatisticalResult {
  const sentences = splitSentences(text);

  const sentenceLengthUniformity = analyzeSentenceLengthUniformity(sentences);
  const vocabularyDiversity = analyzeVocabularyDiversity(text);
  const conjunctionFrequency = analyzeConjunctionFrequency(text, sentences);
  const punctuationRegularity = analyzePunctuationRegularity(text);

  // 各指標を均等に平均
  const overallScore =
    (sentenceLengthUniformity +
      vocabularyDiversity +
      conjunctionFrequency +
      punctuationRegularity) /
    4;

  return {
    sentenceLengthUniformity,
    vocabularyDiversity,
    conjunctionFrequency,
    punctuationRegularity,
    overallScore,
  };
}
