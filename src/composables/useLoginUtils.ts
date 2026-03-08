/**
 * 登录页工具：IP 获取、语言切换、帮助提示
 */
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n";

const LANGUAGES: string[] = ["zh-CN", "zh-TW", "en-ITALIC"];

export function useLoginUtils() {
  const { t, locale } = useI18n();

  const userIp = ref("trying");

  async function getMyIp() {
    try {
      const response = await fetch("/api/get-ip");
      const data = await response.json();
      userIp.value = data.ip;
    } catch (error) {
      console.error(
        t("error.ip_fail", {
          error: error instanceof Error ? error.message : String(error),
        })
      );
      userIp.value = "fail";
    }
  }

  function switchLanguage() {
    const i = LANGUAGES.indexOf(locale.value as string);
    const next = LANGUAGES[(i + 1) % LANGUAGES.length];
    if (next !== "zh-CN" && next !== "en-ITALIC" && next !== "zh-TW") return;
    setLocale(next);
  }

  function question() {
    alert(t("login_card.question_alert"));
  }

  return {
    userIp,
    getMyIp,
    switchLanguage,
    question,
  };
}
