import { NextRequest, NextResponse } from "next/server";
import { analyzeWithHuggingFace } from "@/lib/huggingface";
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
const CONCURRENCY_LIMIT = 2;

/** 並列数を制限して処理する */
async function processWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
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

    const results: ParagraphResultItem[] = await processWithLimit(
      paragraphs,
      CONCURRENCY_LIMIT,
      async (text: string, index: number): Promise<ParagraphResultItem> => {
        // 統計分析（常に実行）
        const stats = analyzeStatistically(text);

        // HuggingFace AI モデル分析（無料）
        let aiModelProb: number | null = null;
        try {
          aiModelProb = await analyzeWithHuggingFace(text);
        } catch {
          // HuggingFace エラーは無視して統計のみで判定
        }

        // 総合スコア算出
        let generatedProb: number;
        if (aiModelProb !== null) {
          generatedProb =
            aiModelProb * WEIGHTS.AI_MODEL +
            stats.overallScore * WEIGHTS.STATISTICAL;
        } else {
          generatedProb = stats.overallScore;
        }

        return {
          index,
          text,
          generatedProb,
          aiModelProb,
          statisticalProb: stats.overallScore,
          classification: classify(generatedProb),
          skipped: false,
        };
      }
    );

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
