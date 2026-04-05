interface LoadingIndicatorProps {
  paragraphCount: number;
}

export default function LoadingIndicator({
  paragraphCount,
}: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-4 text-slate-600">
        分析中... {paragraphCount}段落を処理しています
      </p>
    </div>
  );
}
