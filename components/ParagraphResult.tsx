import type { ParagraphResultItem } from "@/types";
import { COLORS, LABELS } from "@/lib/constants";

interface ParagraphResultProps {
  result: ParagraphResultItem;
}

export default function ParagraphResult({ result }: ParagraphResultProps) {
  const cls = result.skipped ? "skipped" : result.classification;
  const color = COLORS[cls];
  const label = LABELS[cls];
  const prob = Math.round(result.generatedProb * 100);

  return (
    <div
      className={`${color.bg} ${color.border} border-l-4 rounded-lg p-4 transition-all`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500">
              段落 {result.index + 1}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${color.badge}`}>
              {label}
            </span>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {result.text}
          </p>
        </div>
        {!result.skipped && (
          <div className="flex-shrink-0 text-right">
            <div className={`text-2xl font-bold ${color.text}`}>{prob}%</div>
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              {result.gptzeroProb !== null && (
                <div>API: {Math.round(result.gptzeroProb * 100)}%</div>
              )}
              <div>統計: {Math.round(result.statisticalProb * 100)}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
