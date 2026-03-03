/**
 * 登录/注册/登出 API 操作
 */
import { useI18n } from "vue-i18n";
import { api } from "./useApi";
import type { useLoginForm } from "./useLoginForm";

type LoginForm = ReturnType<typeof useLoginForm>;

export function useLoginActions(
  form: LoginForm["form"],
  setStatus: LoginForm["setStatus"],
  validateEmail: LoginForm["validateEmail"],
  validatePassword: LoginForm["validatePassword"],
  emit: (event: "login-success", payload?: any) => void
) {
  const { t } = useI18n();

  async function handleRegister() {
    const e = validateEmail(form.email);
    if (!e.ok) { setStatus(e.reason, "error"); return; }
    const p = validatePassword(form.password);
    if (!p.ok) { setStatus(p.reason, "error"); return; }

    setStatus(t("login_card.status.registering"), "muted");
    try {
      await api("/api/register", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      setStatus(t("login_card.status.register_success"), "success");
    } catch (e: any) {
      setStatus(
        t("login_card.status.register_fail") + (e.data?.message || t("login_card.status.internal_error")),
        "error"
      );
    }
  }

  async function handleLogin() {
    const e = validateEmail(form.email);
    if (!e.ok) { setStatus(e.reason, "error"); return; }
    const p = validatePassword(form.password);
    if (!p.ok) { setStatus(p.reason, "error"); return; }

    setStatus(t("login_card.status.logging_in"), "muted");
    try {
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      setStatus(t("login_card.status.login_success", { email: form.email }), "success");
      try {
        if (data) emit("login-success", data.success);
      } catch (emitError) {
        console.error("login_card.emit_error", {
          error: emitError instanceof Error ? emitError.message : String(emitError),
        });
      }
    } catch (e: any) {
      setStatus(
        t("login_card.status.login_fail") + (e.data?.message || t("login_card.status.internal_error")),
        "error"
      );
    }
  }

  async function handleLogout() {
    try {
      await api("/api/logout", { method: "POST" });
      setStatus(t("login_card.status.logout_success"), "muted");
      form.email = "";
      form.password = "";
      emit("login-success", null);
    } catch (e: any) {
      setStatus(
        t("login_card.status.logout_fail") + (e.data?.message || t("login_card.status.internal_error")),
        "error"
      );
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleLogout,
  };
}
