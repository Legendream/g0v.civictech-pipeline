import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://civictech-guide.claire-cheng.com',

  // 根目錄沒有內容，一律轉到語言前綴底下。
  // 之後加英文時，這裡不用改：/en/ 由 src/pages/en/ 自己產生。
  redirects: {
    '/': '/zh/',
  },
});
