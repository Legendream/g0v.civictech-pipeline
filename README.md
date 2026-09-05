# 臺灣公民科技行動指引

網站原始碼。上線網址：`https://civictech-guide.claire-cheng.com`（尚未上線）

**狀態**：地基建置中，2026-09-05 開工。

## 這個站在講什麼

一條線：問卷調查發現社群卡在哪裡，入口其實已經存在（臺灣公民科技資料庫），
缺的是有人把做過的經驗寫下來，所以做了一條半自動的寫作生產鏈，
整條攤開讓任何人拿去自己做。

公民科技是這次的示範領域，方法本身跟領域無關。

## 三個 repo 的分工

| repo | 放什麼 |
|---|---|
| 這裡 | 網站本體：敘事、頁面、留言區 |
| [Taiwan-civic-tech-research](https://github.com/Legendream/Taiwan-civic-tech-research) | 問卷分析報告的正本 |
| [AI-Writing-Skill](https://github.com/Legendream/AI-Writing-Skill) | 寫作方法資產的正本（SKILL、模板、驗收清單） |

**正本只有一份。** 這個站對報告與流程只做導讀與連結，不複製全文。
複製會分岔，然後兩個版本說不一樣的話。

## 技術（規劃，尚未實作）

Astro 產生靜態頁，部署在 Cloudflare Workers（靜態檔由 Workers 直接送出，
設定在 `wrangler.jsonc`），留言區用 D1 加 Turnstile。
後台那幾格設定與踩過的坑寫在 `docs/部署設定.md`。

## 語言

目前只做中文。架構保留英文擴充的空間：網址帶 `/zh/` 前綴、
內容檔放 `content/zh/`、介面字串抽在 JSON、留言資料表含 `locale` 欄位。

翻不翻的判準是**它還會不會變**：已定稿不再修改的內容（問卷報告）可以翻，
還在演化的內容（寫作流程規則本體）不翻，翻了等於認養一份會一直分岔的雙胞胎。

## 開發紀律

- 不直接 commit 到 `main`。每次改動先開分支，開 PR，由 Claire merge
- 動手前先寫驗收條件，放在 `docs/站①驗收條件_*.md`
- 一批 PR 只做一個目的
