/**
 * 账户设置相关操作
 */
import { useI18n } from "vue-i18n";
import { api } from "./useApi";
import { STORAGE_KEY } from "./useSettingsStorage";
import type { useSettingState } from "./useSettingState";

type SettingState = ReturnType<typeof useSettingState>;

export function useAccountSettings(
    current: SettingState["current"],
    setStatus: SettingState["setStatus"],
    emit: { (event: "log-out"): void, (event: "close"): void }
) {
    const { t } = useI18n();

    function onChangeNickname() {
        setStatus(t("setting.status.nickname_todo"), "muted");
    }

    function onChangePassword() {
        setStatus(t("setting.status.password_todo"), "muted");
    }

    function onChangeEmail() {
        setStatus(t("setting.status.email_todo"), "muted");
    }

    async function onExportData() {
        const LOCK_KEY = "whatIveDone_export_lock_v1";

        async function sha256Base64(msg: string) {
            const enc = new TextEncoder();
            const buf = await crypto.subtle.digest("SHA-256", enc.encode(msg));
            const bytes = new Uint8Array(buf);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++)
                binary += String.fromCharCode(bytes[i]);
            return btoa(binary);
        }

        // 检查是否存在有效锁
        try {
            const raw = localStorage.getItem(LOCK_KEY);
            if (raw) {
                try {
                    const obj = JSON.parse(raw);
                    if (obj?.ts && obj?.sig) {
                        const expected = await sha256Base64(
                            String(obj.ts) + "|" + location.origin + "|" + navigator.userAgent
                        );
                        if (expected === obj.sig) {
                            const now = Date.now();
                            const elapsed = now - Number(obj.ts);
                            const limit = 60 * 60 * 1000;
                            if (elapsed < limit) {
                                const remainingSec = Math.ceil((limit - elapsed) / 1000);
                                setStatus(
                                    t("setting.account.export.locked", { s: remainingSec }),
                                    "error"
                                );
                                return;
                            }
                        } else {
                            localStorage.removeItem(LOCK_KEY);
                        }
                    } else {
                        localStorage.removeItem(LOCK_KEY);
                    }
                } catch {
                    localStorage.removeItem(LOCK_KEY);
                }
            }
        } catch (e) {
            console.warn("Export lock check failed:", e);
        }

        // 进行导出
        try {
            const data = await api(`/api/posts?all="true"`);
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            const dateStr = new Date().toISOString().slice(0, 10);
            a.download = `whatIveDone_export_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                try {
                    URL.revokeObjectURL(url);
                } catch {
                    /* noop */
                }
                try {
                    document.body.removeChild(a);
                } catch {
                    /* noop */
                }
            }, 1500);

            try {
                const ts = Date.now();
                const sig = await sha256Base64(
                    String(ts) + "|" + location.origin + "|" + navigator.userAgent
                );
                localStorage.setItem(LOCK_KEY, JSON.stringify({ ts, sig }));
            } catch (e) {
                console.warn("Failed to persist export lock:", e);
            }
            setStatus(
                t("setting.status.export_success", { timestamp: dateStr }),
                "success"
            );
        } catch (err) {
            console.error("Export failed:", err);
            setStatus(
                t("setting.status.export_failed", {
                    error: (err as Error).message,
                }),
                "error"
            );
            return;
        }
    }

    function onImportData() {
        setStatus(t("setting.status.import_todo"), "muted");
    }

    function onManageSessions() {
        setStatus(t("setting.status.sessions_todo"), "muted");
    }

    async function onDeleteAllData() {
        if (
            current.confirmDelete &&
            prompt(t("setting.status.clear_data_confirm")) !==
            t("setting.status.clear_data_confirm_text")
        ) {
            alert(t("setting.status.clear_data_cancelled"));
            return;
        }
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem("whatIveDone_theme");
            localStorage.removeItem("whatIveDone_locale");
            await api("/api/delete", { method: "DELETE" });
        } catch (e) {
            console.warn("Failed to clear local settings:", e);
        }
        setStatus(t("setting.status.clear_data_success"), "muted");
    }

    async function onDeleteAccount() {
        if (
            current.confirmDelete &&
            prompt(t("setting.status.delete_account_confirm")) !==
            t("setting.status.delete_account_confirm_text")
        ) {
            alert(t("setting.status.delete_account_cancelled"));
            return;
        }
        try {
            await api("/api/delete-account", { method: "POST" });
            await api("/api/logout", { method: "POST" });
            setStatus(t("setting.status.delete_account_success"), "success");
            emit("log-out");
            emit("close");
        } catch (e) {
            console.warn("Failed to delete account:", e);
        } finally {
            await api("/api/me"); // 触发前端状态更新
        }
        setStatus(t("setting.status.delete_account_todo"), "muted");
    }

    return {
        onChangeNickname,
        onChangePassword,
        onChangeEmail,
        onExportData,
        onImportData,
        onManageSessions,
        onDeleteAllData,
        onDeleteAccount,
    };
}
