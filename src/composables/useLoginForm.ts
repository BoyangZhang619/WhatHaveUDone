/**
 * 登录表单状态、校验 & 状态提示
 */
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

export function useLoginForm() {
  const { t } = useI18n();

  const form = reactive({
    email: "",
    password: "",
  });

  const status = reactive({
    msg: "",
    kind: "muted" as "muted" | "error" | "success",
  });

  function setStatus(msg: string | undefined, kind: "muted" | "error" | "success" = "muted") {
    status.msg = String(msg).slice(0, 1000);
    status.kind = kind;
  }

  // --- 校验规则 ---
  const MIN_EMAIL_LENGTH = 5;
  const MAX_EMAIL_LENGTH = 254;
  const MAX_PASSWORD_LENGTH = 128;

  function validateEmail(email: string): { ok: boolean; reason?: string } {
    if (!email) return { ok: false, reason: t("login_card.validation.email.email_required") };
    if (email.length < MIN_EMAIL_LENGTH) return { ok: false, reason: t("login_card.validation.email.email_min_length") };
    if (email.length > MAX_EMAIL_LENGTH) return { ok: false, reason: t("login_card.validation.email.email_max_length") };
    const re = /^[^\s@]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return re.test(email) ? { ok: true } : { ok: false, reason: t("login_card.validation.email.email_invalid") };
  }

  function validatePassword(pw: string): { ok: boolean; reason?: string } {
    if (pw == null) return { ok: false, reason: t("login_card.validation.password.password_required") };
    if (pw.length < 6) return { ok: false, reason: t("login_card.validation.password.password_min_length") };
    if (pw.length > MAX_PASSWORD_LENGTH) return { ok: false, reason: t("login_card.validation.password.password_max_length") };
    if (/[<>]/.test(pw)) return { ok: false, reason: t("login_card.validation.password.password_no_<>") };
    if (!/^[\x20-\x7E]+$/.test(pw)) return { ok: false, reason: t("login_card.validation.password.password_no_support_letter") };
    return { ok: true };
  }

  return {
    form,
    status,
    setStatus,
    validateEmail,
    validatePassword,
  };
}
