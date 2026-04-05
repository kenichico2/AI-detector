export default function Header() {
  return (
    <header className="text-center py-8">
      <h1 className="text-3xl font-bold text-slate-800">AI文章検出ツール</h1>
      <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
        学生のレポートを貼り付けて、AIが生成した可能性のある部分を段落ごとに検出します。
        <br />
        <span className="text-sm text-slate-500">
          GPTZero API と統計的手法のハイブリッド判定
        </span>
      </p>
    </header>
  );
}
