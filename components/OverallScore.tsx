import type { OverallResult } from "@/types";
import { classify, COLORS } from "@/lib/constants";

interface OverallScoreProps {
  overall: OverallResult;
  hasModel: boolean;
}

export default function OverallScore({ overall, hasModel }: OverallScoreProps) {
  const prob = Math.round(overall.averageGeneratedProb * 100);
  const cls = classify(overall.averageGeneratedProb);
  const color = COLORS[cls];

  const total = overall.totalParagraphs;
  const humanPct = total > 0 ? (overall.humanParagraphs / total) * 100 : 0;
  const mixedPct = total > 0 ? (overall.mixedParagraphs / total) * 100 : 0;
  const aiPct = total > 0 ? (overall.aiParagraphs / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">分析結果</h2>
        <div className="text-right">
          <div className={`text-3xl font-bold ${color.text}`}>{prob}%</div>
          <div className="text-xs text-slate-500">AI生成確率（全体平均）</div>
        </div>
      </div>

      {/* スタックバー */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 mb-3">
        {humanPct > 0 && (
          <div
            className="bg-green-400 transition-all"
            style={{ width: `${humanPct}%` }}
          />
        )}
        {mixedPct > 0 && (
          <div
            className="bg-yellow-400 transition-all"
            style={{ width: `${mixedPct}%` }}
          />
        )}
        {aiPct > 0 && (
          <div
            className="bg-red-400 transition-all"
            style={{ width: `${aiPct}%` }}
          />
        )}
      </div>

      {/* 内訳 */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-slate-600">
            人間: {overall.humanParagraphs}段落
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-slate-600">
            混在: {overall.mixedParagraphs}段落
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="text-slate-600">
            AI: {overall.aiParagraphs}段落
          </span>
        </div>
      </div>

      {/* 分析手法の表示 */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          {hasModel
            ? "判定方式: AIモデル（RoBERTa, 70%）+ 統計的手法（30%）"
            : "判定方式: 統計的手法のみ（AIモデル接続エラー）"}
        </p>
      </div>
    </div>
  );
}
