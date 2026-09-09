# 臺灣公民科技行動指引

**網站：<https://civictech-guide.claire-cheng.com>**

這個 repo 是網站原始碼。網站已上線，五個頁面都在。

## 這個站在講什麼

一條線：問卷調查發現社群卡在哪裡，入口其實已經存在（臺灣公民科技資料庫），
缺的是有人把做過的經驗寫下來，所以做了一條半自動的寫作生產鏈，
整條攤開讓任何人拿去自己做。

公民科技是這次的示範領域，方法本身跟領域無關。

## 網站上有哪五頁

| 頁面 | 講什麼 |
|---|---|
| [首頁](https://civictech-guide.claire-cheng.com/zh/) | 整條敘事線的入口。為什麼需要這套流程、三大核心特色、兩條上手路徑、方法的領域適用性 |
| [為什麼要做這個](https://civictech-guide.claire-cheng.com/zh/why/) | 127 份問卷的研究發現：擋住人的是資訊與入口不是技術門檻、活動傳得了消息傳不了經驗、11 篇實務文章怎麼選題配置、研究方法的解讀邊界 |
| [這套流程](https://civictech-guide.claire-cheng.com/zh/pipeline/) | 兩種文體的差別、八個協作階段每一站由 AI 做什麼由人決定什麼、品質控管哪三站不能省、六樣交付物、授權規範、發布檢驗的三道指標 |
| [怎麼開始](https://civictech-guide.claire-cheng.com/zh/start/) | 準備清單、四種 AI 工具的實測支援狀態、瀏覽器與本機兩條上手路徑、怎麼確認流程真的載入了、常見問題 |
| [關於這個網站](https://civictech-guide.claire-cheng.com/zh/about/) | 專案發起與合作夥伴、CC BY 4.0 授權、三個正本倉庫的位置、隱私設計、回報問題的管道 |

## 三個 repo 的分工

| repo | 放什麼 |
|---|---|
| 這裡 | 網站本體：敘事、頁面、留言區 |
| [Taiwan-civic-tech-research](https://github.com/Legendream/Taiwan-civic-tech-research) | 問卷分析報告的正本（[網頁版](https://report.claire-cheng.com/)） |
| [AI-Writing-Skill](https://github.com/Legendream/AI-Writing-Skill) | 寫作方法資產的正本（SKILL、模板、驗收清單） |

**正本只有一份。** 這個站對報告與流程只做導讀與連結，不複製全文。
複製會分岔，然後兩個版本說不一樣的話。

## 技術

Astro 產生靜態頁，部署在 Cloudflare Workers（靜態檔由 Workers 直接送出，
自訂網域宣告在 `wrangler.jsonc` 的 `routes`，不要改在後台，兩邊都設會打架）。
後台那幾格設定與踩過的坑寫在 `docs/部署設定.md`，改部署相關的東西之前先讀那份。

正文是靜態 HTML，不靠 JavaScript 才長得出來——這個站自己在教別人
「你的文章要讓機器人拿得到字」，自己就得做到。全站不載入任何第三方資源，
唯一例外是 about 頁的留言區：它呼叫 `worker/index.js` 這支自己寫的程式與
D1 資料庫，並載入 Cloudflare Turnstile 判斷留言是不是機器人送的。

內容檔一頁一個 `.mdx`，放在 `src/pages/<語言>/`，檔名即網址。
正文照樣用 Markdown 寫，需要卡片、圖表、時間軸的地方才插 `src/components/` 的元件。
版面元件裡不出現寫死的中文，介面字串一律走 `src/i18n/<語言>.json`。

深色模式預設跟隨系統，另有手動切換鈕，選擇存在瀏覽器本機。

**留言區**：程式碼已寫好（`worker/index.js` 處理 `/api/comments`，
`src/components/Comments.astro` 是前端），但 D1 資料庫與 Turnstile 金鑰要用
Cloudflare 帳號手動建立，設定步驟見 `docs/部署設定.md`。設定完成前，
留言表單看得到但送不出去。

## 語言

目前只做中文。架構保留英文擴充的空間：網址帶 `/zh/` 前綴、
內容檔放 `src/pages/zh/`、介面字串抽在 JSON、留言資料表含 `locale` 欄位。

翻不翻的判準是**它還會不會變**：已定稿不再修改的內容（問卷報告）可以翻，
還在演化的內容（寫作流程規則本體）不翻，翻了等於認養一份會一直分岔的雙胞胎。

## 開發紀律

- 不直接 commit 到 `main`。每次改動先開分支，開 PR，由 Claire merge
- 動手前先寫驗收條件，放在 `docs/站①驗收條件_*.md`
- 一批 PR 只做一個目的
- 分支推上去 Cloudflare 就會產生預覽網址，需要跑起來才驗得到的東西在預覽網址上驗，
  不要把 merge 當成自己的除錯步驟
