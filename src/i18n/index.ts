import {createI18n} from 'vue-i18n';
import zh_CN from './locales/zh-CN.json';
import en_US from './locales/en-US.json';
import zh_TW from './locales/zh-TW.json';
import en_BOLD from './locales/en-bold.json';
import en_ITALIC from './locales/en-italic.json';
import en_SCRIPT from './locales/en-script.json';
import en_GOTHIC from './locales/en-gothic.json';
import {Ref} from 'vue';

export const SUPPORTED_LOCALES = {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'zh-TW': '繁體中文',
    'en-BOLD': 'English (Bold)',
    'en-ITALIC': 'English (Italic)',
    'en-SCRIPT': 'English (Script)',
    'en-GOTHIC': 'English (Gothic)',
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