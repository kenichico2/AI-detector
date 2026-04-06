const HF_API_URL =
  "https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector";

/** HuggingFace レスポンスの型 */
interface HFClassification {
  label: string;
  score: number;
}

/**
 * HuggingFace Inference API (無料) で AI 生成確率を判定する。
 * モデル: roberta-base-openai-detector
 * APIトークンなしでも動作するが、設定すればレートリミットが緩和される。
 */
export async function analyzeWithHuggingFace(
  text: string
): Promise<number | null> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.HF_API_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ inputs: text }),
  });

  // モデルがロード中の場合（503）は少し待ってリトライ
  if (res.status === 503) {
    await new Promise((r) => setTimeout(r, 3000));
    const retry = await fetch(HF_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ inputs: text }),
    });
    if (!retry.ok) return null;
    return parseHFResponse(await retry.json());
  }

  // レートリミット（429）は待ってリトライ
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    const retry = await fetch(HF_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ inputs: text }),
    });
    if (!retry.ok) return null;
    return parseHFResponse(await retry.json());
  }

  if (!res.ok) return null;

  return parseHFResponse(await res.json());
}

/**
 * HuggingFace のレスポンスから "Fake"（AI生成）の確率を抽出する。
 * roberta-base-openai-detector は "Real" と "Fake" の2クラス分類。
 */
function parseHFResponse(data: unknown): number | null {
  // レスポンスは [[{label, score}, {label, score}]] 形式
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

  const classifications = data[0] as HFClassification[];
  const fake = classifications.find(
    (c) => c.label.toLowerCase() === "fake" || c.label === "LABEL_0"
  );

  return fake?.score ?? null;
}
