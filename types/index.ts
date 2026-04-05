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
  gptzeroProb: number | null;
  statisticalProb: number;
  classification: Classification;
  skipped: boolean;
  error?: string;
}

export type Classification = "human" | "mixed" | "ai" | "skipped";

/** GPTZero API のレスポンス型 */
export interface GPTZeroResponse {
  documents: Array<{
    average_generated_prob: number;
    completely_generated_prob: number;
    overall_burstiness: number;
    paragraphs: Array<{
      completely_generated_prob: number;
      num_sentences: number;
      start_sentence_index: number;
    }>;
    sentences: Array<{
      generated_prob: number;
      perplexity: number;
      sentence: string;
    }>;
  }>;
}

/** 統計分析の結果 */
export interface StatisticalResult {
  sentenceLengthUniformity: number;
  vocabularyDiversity: number;
  conjunctionFrequency: number;
  punctuationRegularity: number;
  overallScore: number;
}
