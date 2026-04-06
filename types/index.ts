/** クライアント → API ルートへのリクエスト */
export interface DetectRequest {
  paragraphs: string[];
}

/** API ルート → クライアントへのレスポンス */
export interface DetectResponse {
  overall: OverallResult;
  paragraphs: ParagraphResultItem[];
}

export interface OverallResult {
  averageGeneratedProb: number;
  totalParagraphs: number;
  aiParagraphs: number;
  mixedParagraphs: number;
  humanParagraphs: number;
}

export interface ParagraphResultItem {
  index: number;
  text: string;
  generatedProb: number;
  aiModelProb: number | null;
  statisticalProb: number;
  classification: Classification;
  skipped: boolean;
  error?: string;
}

export type Classification = "human" | "mixed" | "ai" | "skipped";

/** 統計分析の結果 */
export interface StatisticalResult {
  sentenceLengthUniformity: number;
  vocabularyDiversity: number;
  conjunctionFrequency: number;
  punctuationRegularity: number;
  overallScore: number;
}
