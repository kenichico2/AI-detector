import { MIN_PARAGRAPH_LENGTH } from "./constants";

export interface SplitParagraph {
  index: number;
  text: string;
  skipped: boolean;
}

/**
 * テキストを段落に分割する。
 * - \r\n を \n に正規化
 * - 空行（1行以上の空行）で分割
 * - 空行がない場合は単一の \n で分割
 * - 短すぎる段落は skipped フラグを立てる
 */
export function splitIntoParagraphs(input: string): SplitParagraph[] {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  // まず空行で分割を試みる
  let chunks = normalized.split(/\n\s*\n+/);

  // 空行分割で1チャンクしかなければ、単一改行で分割
  if (chunks.length === 1) {
    chunks = normalized.split(/\n/);
  }

  return chunks
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .map((text, index) => ({
      index,
      text,
      skipped: text.length < MIN_PARAGRAPH_LENGTH,
    }));
}
