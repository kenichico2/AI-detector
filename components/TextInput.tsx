"use client";

import { useState } from "react";

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export default function TextInput({ onSubmit, isLoading }: TextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここにレポートのテキストを貼り付けてください..."
        className="w-full min-h-[200px] p-4 border border-slate-300 rounded-lg resize-y
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   text-slate-800 placeholder-slate-400 bg-white"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-slate-500">
          {text.length.toLocaleString()} 文字
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setText("")}
            disabled={isLoading || !text}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600
                       hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
          >
            クリア
          </button>
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white
                       hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isLoading ? "分析中..." : "分析する"}
          </button>
        </div>
      </div>
    </form>
  );
}
