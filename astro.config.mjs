import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// 把 Markdown 產生的 <table> 包一層可橫向捲動的容器。
// 舊站的表格在手機上會被裁切，而規矩是 Markdown 裡不能加 class，
// 所以在這裡動，內容檔不必知道有這回事。
function rehypeWrapTables() {
  return (tree) => {
    const visit = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        visit(child);
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-scroll'], tabindex: 0, role: 'region' },
            children: [child],
          };
        }
        return child;
      });
    };
    visit(tree);
  };
}

export default defineConfig({
  site: 'https://civictech-guide.claire-cheng.com',

  // 內容檔是 .mdx：正文照樣用 Markdown 寫，需要卡片、圖表、時間軸的地方才插元件。
  // 「一頁一個檔、檔名即網址」跟「內容跟版型分家」兩條原則都沒有變。
  integrations: [mdx()],

  markdown: {
    rehypePlugins: [rehypeWrapTables],
  },

  // 根目錄沒有內容，一律轉到語言前綴底下。
  // 之後加英文時，這裡不用改：/en/ 由 src/pages/en/ 自己產生。
  redirects: {
    '/': '/zh/',
  },
});
