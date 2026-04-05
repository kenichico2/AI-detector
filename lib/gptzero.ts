import type { GPTZeroResponse } from "@/types";

const GPTZERO_API_URL = "https://api.gptzero.me/v2/predict/text";

/**
 * GPTZero API に段落テキストを送信し、AI生成確率を返す。
 * API キーが未設定の場合は null を返す。
 */
export async function analyzeWithGPTZero(
  text: string
): Promise<number | null> {
  const apiKey = process.env.GPTZERO_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(GPTZERO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ document: text }),
  });

  if (res.status === 429) {
    // レートリミット: 1秒待ってリトライ
    await new Promise((r) => setTimeout(r, 1000));
    const retry = await fetch(GPTZERO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ document: text }),
    });
    if (!retry.ok) return null;
    const data: GPTZeroResponse = await retry.json();
    return data.documents?.[0]?.average_generated_prob ?? null;
  }

  if (!res.ok) return null;

  const data: GPTZeroResponse = await res.json();
  return data.documents?.[0]?.average_generated_prob ?? null;
}
