import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGPTZero } from "@/lib/gptzero";
import { analyzeStatistically } from "@/lib/statisticalAnalysis";
import { classify, WEIGHTS } from "@/lib/constants";
import type {
  DetectRequest,
  DetectResponse,
  ParagraphResultItem,
  OverallResult,
} from "@/types";

const MAX_PARAGRAPHS = 50;
const MAX_TOTAL_LENGTH = 50_000;
const CONCURRENCY_LIMIT = 3;

/** 並列数を制限して処理する */
async function processWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body: DetectRequest = await request.json();
    const { paragraphs } = body;

    if (!paragraphs || !Array.isArray(paragraphs) || paragraphs.length === 0) {
      return NextResponse.json(
        { error: "段落が指定されていません。" },
        { status: 400 }
      );
    }

    if (paragraphs.length > MAX_PARAGRAPHS) {
      return NextResponse.json(
        { error: `段落数が上限（${MAX_PARAGRAPHS}）を超えています。` },
        { status: 400 }
      );
    }

    const totalLength = paragraphs.reduce((sum, p) => sum + p.length, 0);
    if (totalLength > MAX_TOTAL_LENGTH) {
      return NextResponse.json(
        { error: "テキストが長すぎます。50,000文字以内にしてください。" },
        { status: 400 }
      );
    }

    const hasApiKey = !!process.env.GPTZERO_API_KEY;

    const results: ParagraphResultItem[] = await processWithLimit(
      paragraphs,
      CONCURRENCY_LIMIT,
      async (text: string): Promise<ParagraphResultItem> => {
        const index = paragraphs.indexOf(text);

        // 統計分析（常に実行）
        const stats = analyzeStatistically(text);

        // GPTZero 分析（APIキーがある場合のみ）
        let gptzeroProb: number | null = null;
        try {
          gptzeroProb = await analyzeWithGPTZero(text);
        } catch {
          // GPTZero エラーは無視して統計のみで判定
        }

        // 総合スコア算出
        let generatedProb: number;
        if (gptzeroProb !== null) {
          generatedProb =
            gptzeroProb * WEIGHTS.GPTZERO +
            stats.overallScore * WEIGHTS.STATISTICAL;
        } else {
          generatedProb = stats.overallScore;
        }

        return {
          index,
          text,
          generatedProb,
          gptzeroProb,
          statisticalProb: stats.overallScore,
          classification: classify(generatedProb),
          skipped: false,
        };
      }
    );

    // インデックスを修正（indexOf の重複問題を回避）
    results.forEach((r, i) => {
      r.index = i;
    });

    // 全体スコア算出
    const overall: OverallResult = {
      averageGeneratedProb:
        results.reduce((sum, r) => sum + r.generatedProb, 0) / results.length,
      totalParagraphs: results.length,
      aiParagraphs: results.filter((r) => r.classification === "ai").length,
      mixedParagraphs: results.filter((r) => r.classification === "mixed")
        .length,
      humanParagraphs: results.filter((r) => r.classification === "human")
        .length,
    };

    const response: DetectResponse = { overall, paragraphs: results };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
