-- 留言資料表。
-- 批次三才會真的建，這一批只先把 schema 定下來：
-- 資料表結構事後要改，比改程式麻煩得多。
--
-- locale 欄位現在只會有 zh，但一定要從第一天就存在，
-- 之後加英文才不用回頭做資料遷移。

CREATE TABLE IF NOT EXISTS comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  page        TEXT NOT NULL,                        -- 留言掛在哪一頁，例如 pipeline
  locale      TEXT NOT NULL,                        -- 語言代號，目前只有 zh
  author      TEXT,                                 -- 可留空，訪客免註冊
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  -- 送出即公開（visible），保留事後下架的權利（hidden）
  status      TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden'))
);

CREATE INDEX IF NOT EXISTS idx_comments_page ON comments (locale, page, created_at);
