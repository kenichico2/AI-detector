# AI文章検出ツール

学生のレポートを段落ごとに分析し、AIが生成した可能性のある部分を検出するツールです。Webアプリ（Next.js）とGoogle Colabノートブックの2つの実行方法を提供します。

---

## Colabノートブック（Binoculars + 統計的手法 比較）

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/kenichico2/AI-detector/blob/claude/ai-text-detector-fTEG9/notebooks/ai_detector_comparison.ipynb)

上のボタンをクリックすると、Google Colab上でノートブックが開きます。

- **Binoculars**（LLMベース）と**統計的手法**の2手法を段落ごとに比較
- T4 GPU推奨（falcon-7b 4bit量子化）、GPU不足時はgpt2にフォールバック
- 棒グラフ・散布図・色付き段落表示で結果を可視化

### 使い方
1. 上のバッジをクリック → Colabでノートブックが開く
2. ランタイム → 「ランタイムのタイプを変更」→ GPU: T4 を選択
3. `sample_text` にレポートのテキストを貼り付け
4. 全セルを実行

---

## Webアプリ

HuggingFace Inference API（RoBERTa）と統計的手法のハイブリッド判定を行うWebアプリです。APIキー不要・完全無料で動作します。

### セットアップ

```bash
npm install
cp .env.local.example .env.local  # HF_API_TOKEN はオプション
npm run dev
```

http://localhost:3000 にアクセスし、テキストを貼り付けて「分析する」をクリック。

### Vercelデプロイ

1. GitHubリポジトリをVercelにインポート
2. 環境変数 `HF_API_TOKEN` を設定（オプション、レートリミット緩和）
3. 自動デプロイ完了

---

## 検出手法

### 統計的手法（両ツール共通）

| 指標 | AI的なテキストの特徴 |
|---|---|
| 文長均一性 | 文の長さのばらつきが小さい |
| 語彙多様性 (TTR) | Type-Token Ratioが中程度（0.4〜0.6） |
| 接続詞頻度 | 「また」「さらに」「したがって」等を多用 |
| 句読点規則性 | 句読点の間隔が等間隔に近い |

### Binoculars（Colabノートブック）

論文 "Spotting LLMs With Binoculars" に基づく手法。Observer（汎用LLM）とPerformer（instruction-tuned LLM）の2つのモデルのクロスエントロピー比率でAI生成テキストを検出。

### HuggingFace RoBERTa（Webアプリ）

`openai-community/roberta-base-openai-detector` モデルをHuggingFace無料Inference API経由で使用。

---

## 判定基準

| スコア | 判定 | 色 |
|---|---|---|
| 75%以上 | AIが生成した可能性が高い | 赤 |
| 40〜75% | 判定が混在 | 黄 |
| 40%未満 | 人間が書いた可能性が高い | 緑 |

総合スコア = AIモデル (70%) + 統計的手法 (30%)
