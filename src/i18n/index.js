// 介面字串與語言設定的唯一來源。
// 加一個語言要動的地方：
//   1. 這個檔的 LOCALES 加一個代號，並且 import 那份 json、把它加進 STRINGS
//      （漏了 STRINGS 那筆不會報錯，getStrings() 會靜默退回預設語言）
//   2. 新增 src/i18n/<代號>.json
//   3. 新增 src/pages/<代號>/*.mdx（只翻幾頁也可以，沒翻的那幾頁不會被宣告成 hreflang）
//   4. 只有在「代號跟 HTML 的語言標記長得不一樣」時，HTML_LANG 才要補一筆
//      （例如 zh 要寫成 zh-Hant；en、ja 這種一模一樣的就不用）
// 版型檔（src/layouts/Base.astro）不需要改。
import zh from './zh.json';

export const LOCALES = ['zh'];
export const DEFAULT_LOCALE = 'zh';

// 語言代號跟 HTML 語言標記不一致時的對照表。沒列到的代號直接沿用代號本身，
// 所以漏加一筆不會產生空的 lang 屬性。
const HTML_LANG = {
  zh: 'zh-Hant',
};

/** 取 <html lang> 與 hreflang 要用的語言標記 */
export function htmlLang(locale) {
  return HTML_LANG[locale] ?? locale;
}

const STRINGS = { zh };

/** 從網址路徑取出語言代號，例如 /zh/why/ 得到 zh */
export function getLocaleFromPath(pathname) {
  const first = pathname.split('/').filter(Boolean)[0];
  return LOCALES.includes(first) ? first : DEFAULT_LOCALE;
}

/** 取某個語言的介面字串，沒有就退回預設語言 */
export function getStrings(locale) {
  return STRINGS[locale] ?? STRINGS[DEFAULT_LOCALE];
}

/** 把路徑換成另一個語言版本，例如 (/zh/why/, en) 得到 /en/why/ */
export function swapLocale(pathname, locale) {
  const parts = pathname.split('/').filter(Boolean);
  if (LOCALES.includes(parts[0])) parts[0] = locale;
  else parts.unshift(locale);
  return `/${parts.join('/')}/`.replace(/\/+$/, '/');
}

/** 網址一律整理成 /a/b/ 的樣子，尾斜線與 .html 的有無都不影響比對 */
function normaliseUrl(pathname) {
  return `${pathname.replace(/\/+$/, '').replace(/\.html$/, '')}/`;
}

/** 把 glob 給的檔案路徑（.../pages/zh/why.md）換算成它產出的網址 /zh/why/ */
function fileToUrl(path) {
  // 只切掉第一個 pages/ 以前的部分：頁面樹裡若再有一層叫 pages 的目錄，
  // 從後面切會把前面整段路徑吃掉。
  const fromPages = path.replace(/^.*?\/pages\//, '/');
  return normaliseUrl(fromPages.replace(/\.[^/.]+$/, '').replace(/\/index$/, ''));
}

// 實際存在的內容頁清單。import.meta.glob 在建置時就展開，這裡只拿鍵（檔案路徑），
// 沒有 import 任何一頁的內容進來。
// 副檔名要跟 Astro 認得的頁面格式一致，之後多支援一種格式（例如 .mdoc）就要跟著補。
const PAGE_URLS = new Set(
  Object.keys(import.meta.glob('../pages/**/*.{md,mdx,astro,html}')).map(fileToUrl)
);

// 一頁都沒找到，或換算出來的不是網址，都代表 glob 樣式跟實際的檔案位置對不上了。
// 這種事要在建置時大聲失敗，不然全站的 hreflang 會安靜地整批消失。
if (PAGE_URLS.size === 0 || [...PAGE_URLS].some((url) => !url.startsWith('/'))) {
  throw new Error('src/i18n/index.js 認不得頁面檔案的路徑，請檢查 import.meta.glob 的路徑樣式');
}

/**
 * 這個網址在哪些語言底下真的有對應的頁面，回傳 [{ locale, path }]。
 * 翻譯單位是頁：某頁只有中文時，英文不會出現在回傳的清單裡。
 */
export function localesWithPage(pathname) {
  const here = normaliseUrl(pathname);
  const current = getLocaleFromPath(pathname);
  // 目前這一頁自己一定算數：動態路由的網址對不上檔名（/zh/tag/aaa/ 對 [slug].astro），
  // 但那一頁確實存在。例外是根本不在語言前綴底下的頁（404），那就一筆都不宣告。
  const isUnderLocale = normaliseUrl(swapLocale(pathname, current)) === here;
  return LOCALES
    .filter((locale) =>
      (locale === current && isUnderLocale) ||
      PAGE_URLS.has(normaliseUrl(swapLocale(pathname, locale)))
    )
    .map((locale) => ({ locale, path: swapLocale(pathname, locale) }));
}
