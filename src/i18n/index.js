// 介面字串與語言設定的唯一來源。
// 加一個語言要動的地方：
//   1. 這個檔的 LOCALES 加一個代號
//   2. 新增 src/i18n/<代號>.json
//   3. 新增 src/pages/<代號>/*.md
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
