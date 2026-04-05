import type { DetectResponse } from "@/types";
import OverallScore from "./OverallScore";
import ParagraphResult from "./ParagraphResult";
import type { SplitParagraph } from "@/lib/textSplitter";
import { COLORS, LABELS } from "@/lib/constants";

interface ResultsDisplayProps {
  response: DetectResponse;
  allParagraphs: SplitParagraph[];
  hasApiKey: boolean;
}

export default function ResultsDisplay({
  response,
  allParagraphs,
  hasApiKey,
}: ResultsDisplayProps) {
  // 分析結果と skipped 段落を統合して元の順序で表示
  let analyzedIndex = 0;

  return (
    <div className="space-y-6">
      <OverallScore overall={response.overall} hasApiKey={hasApiKey} />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-500">
          段落ごとの分析結果
        </h3>
        {allParagraphs.map((para) => {
          if (para.skipped) {
            // スキップされた段落
            const color = COLORS.skipped;
            return (
              <div
                key={`skipped-${para.index}`}
                className={`${color.bg} ${color.border} border-l-4 rounded-lg p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-500">
                    段落 {para.index + 1}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${color.badge}`}
                  >
                    {LABELS.skipped}
                  </span>
                </div>
                <p className="text-sm text-slate-400 whitespace-pre-wrap">
                  {para.text}
                </p>
              </div>
            );
          }

          // 分析された段落
          const result = response.paragraphs[analyzedIndex];
          analyzedIndex++;
          if (!result) return null;

          return (
            <ParagraphResult
              key={`result-${para.index}`}
              result={{ ...result, index: para.index }}
            />
          );
        })}
      </div>
    </div>
  );
}
