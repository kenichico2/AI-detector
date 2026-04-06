"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TextInput from "@/components/TextInput";
import LoadingIndicator from "@/components/LoadingIndicator";
import ResultsDisplay from "@/components/ResultsDisplay";
import { splitIntoParagraphs, type SplitParagraph } from "@/lib/textSplitter";
import type { DetectResponse } from "@/types";

export default function Home() {
  const [results, setResults] = useState<DetectResponse | null>(null);
  const [allParagraphs, setAllParagraphs] = useState<SplitParagraph[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasModel, setHasModel] = useState(true);
  const [analyzedCount, setAnalyzedCount] = useState(0);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    const paragraphs = splitIntoParagraphs(text);
    setAllParagraphs(paragraphs);

    const toAnalyze = paragraphs.filter((p) => !p.skipped);
    setAnalyzedCount(toAnalyze.length);

    if (toAnalyze.length === 0) {
      setError(
        "分析可能な段落がありません。50文字以上の段落を含むテキストを入力してください。"
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paragraphs: toAnalyze.map((p) => p.text),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `エラーが発生しました (${res.status})`);
      }

      const data: DetectResponse = await res.json();
      setResults(data);

      // AIモデルが動作したか判定
      const anyModel = data.paragraphs.some((p) => p.aiModelProb !== null);
      setHasModel(anyModel);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "通信エラーが発生しました。もう一度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 pb-12">
      <Header />

      <div className="space-y-8">
        <TextInput onSubmit={handleSubmit} isLoading={isLoading} />

        {isLoading && <LoadingIndicator paragraphCount={analyzedCount} />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {results && (
          <ResultsDisplay
            response={results}
            allParagraphs={allParagraphs}
            hasModel={hasModel}
          />
        )}
      </div>
    </div>
  );
}
