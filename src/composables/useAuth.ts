/**
 * 用户认证 & 顶栏操作
 */
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { api } from "./useApi";
import { useRouter } from 'vue-router';
import { clearUser } from "@/utils/auth";


interface User {
  value: number | null;
  email?: string | null;
}

export function useAuth() {
  const router = useRouter();
  const { t } = useI18n();

  const meUser = reactive<User>({ value: null, email: null });
  const meLoading = ref(false);

  async function refreshMe() {
    meLoading.value = true;
    try {
      const data = await api("/api/me");
      meUser.value = data?.user || null;
      meUser.email = data?.user?.email || null;
      return meUser;
    } catch {
      meUser.value = null;
      return null;
    } finally {
      meLoading.value = false;
    }
  }

  function onOpenSettings() {
    router.push('/settings');
  }

  async function onLogout() {
    try {
      await api("/api/logout", { method: "POST" });
      clearUser();
      router.replace('/login');
    } catch {
      alert(t("other.logout_error"));
    }
  }

  return {
    meUser,
    meLoading,
    refreshMe,
    onOpenSettings,
    onLogout,
  };
}
