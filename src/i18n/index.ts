import { createI18n } from 'vue-i18n';
import zh_CN from './locales/zh-CN.json';
import en_US from './locales/en-US.json';
import zh_TW from './locales/zh-TW.json';


const en_BOLD = JSON.parse(translateDeepObject(en_US, "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙"));
const en_ITALIC = JSON.parse(translateDeepObject(en_US, "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍"));
const en_SCRIPT = JSON.parse(translateDeepObject(en_US, "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵"));
const en_GOTHIC = JSON.parse(translateDeepObject(en_US, "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅"));
function translateDeepObject(data: Record<string, any> | any[], variantStr: string, preserveBrackets = true): string {
    const standardAlphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const variantChars = [...variantStr];
    const charMap: Record<string, string> = {};

    for (let i = 0; i < standardAlphabet.length; i++) {
        const key = standardAlphabet[i];
        charMap[key] = variantChars[i] || key;
    }

    const translate = (str: string) => {
        if (!preserveBrackets) {
            return str.replace(/[a-zA-Z]/g, (match) => charMap[match] || match);
        }

        return str.replace(/{[^{}]*}|([a-zA-Z])/g, (match, letter) => {
            if (letter) {
                return charMap[letter] || letter;
            }
            return match;
        });
    };

    const process = (item: any): any => {
        if (typeof item === "string") return translate(item);

        if (Array.isArray(item)) return item.map(process);

        if (typeof item === "object" && item !== null) {
            const newNode: Record<string, any> = {};
            for (const key in item) {
                if (Object.prototype.hasOwnProperty.call(item, key)) {
                    newNode[key] = process(item[key]);
                }
            }
            return newNode;
        }
        return item;
    };

    return JSON.stringify(process(data));
}

export const SUPPORTED_LOCALES = {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'zh-TW': '繁體中文',
    'en-BOLD': '𝐄𝐧𝐠𝐥𝐢𝐬𝐡 (𝐁𝐨𝐥𝐝)',
    'en-ITALIC': '𝐸𝑛𝑔𝑙𝑖𝑠ℎ (𝐼𝑡𝑎𝑙𝑖𝑐)',
    'en-SCRIPT': '𝐸𝓃𝑔𝓁𝒾𝓈𝒽 (𝒮𝒸𝓇𝒾𝓅𝓉)',
    'en-GOTHIC': '𝕰𝖓𝖌𝖑𝖎𝖘𝖍 (𝕲𝖔𝖙𝖍𝖎𝖈)',
} as const;
export type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

export type MessageSchema = typeof zh_CN;

const STORAGE_KEY = 'whatIveDone_locale';

function detectLocale(): SupportedLocale {
    // 1. 从 localStorage 获取用户的语言偏好
    const storedLocale = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (storedLocale && storedLocale in SUPPORTED_LOCALES) {
        return storedLocale;
    }
    // 2. 如果没有找到，使用浏览器的语言设置
    const browserLocale = navigator.language as SupportedLocale;
    if (browserLocale in SUPPORTED_LOCALES) {
        return browserLocale;
    }
    // 3. 默认使用简体中文
    return 'zh-CN';
}

export const i18n = createI18n<[MessageSchema], SupportedLocale>({
    legacy: false,
    locale: detectLocale(),
    messages: {
        'zh-CN': zh_CN,
        'en-US': en_US,
        'zh-TW': zh_TW,
        'en-BOLD': en_BOLD,
        'en-ITALIC': en_ITALIC,
        'en-SCRIPT': en_SCRIPT,
        'en-GOTHIC': en_GOTHIC
    }
});

export function setLocale(locale: SupportedLocale) {
    if (locale in SUPPORTED_LOCALES) {
        (i18n as any).global.locale.value = locale;
        localStorage.setItem(STORAGE_KEY, locale);
    } else {
        console.warn(`Unsupported locale: ${locale}`);
    }
}