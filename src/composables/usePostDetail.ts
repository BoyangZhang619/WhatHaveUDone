/**
 * 帖子详情查看
 */
import { computed, inject, provide, reactive, ref, type InjectionKey } from "vue";
import { useI18n } from "vue-i18n";
import { api } from "./useApi";
import { formatDate, safeErr } from "./useHelpers";

export type PostDetailReturn = ReturnType<typeof usePostDetail>;
const POST_DETAIL_KEY: InjectionKey<PostDetailReturn> = Symbol("PostDetail");

/** 父组件调用：创建状态并 provide 给子组件 */
export function providePostDetail() {
  const state = usePostDetail();
  provide(POST_DETAIL_KEY, state);
  return state;
}

/** 子组件调用：inject 父组件提供的状态 */
export function injectPostDetail(): PostDetailReturn {
  const state = inject(POST_DETAIL_KEY);
  if (!state) throw new Error("injectPostDetail() 必须在 providePostDetail() 的子组件中使用");
  return state;
}

interface DetailState {
  open: boolean;
  id: number | null;
  post: any | null;
}

export function usePostDetail() {
  const { t } = useI18n();

  const detail = reactive<DetailState>({
    open: false,
    id: null,
    post: null,
  });
  const detailLoading = ref(false);
  const detailError = ref("");

  async function openDetail(id: number | null) {
    detail.open = true;
    detail.id = id;
    detail.post = null;
    detailLoading.value = true;
    detailError.value = "";

    try {
      const data = await api(`/api/posts/${id}`);
      detail.post = data?.post ?? data;
    } catch (e: any) {
      detailError.value = safeErr(e?.data ?? e);
    } finally {
      detailLoading.value = false;
    }
  }

  const detailDate = computed(() => {
    const p = detail.post || {};
    return (
      p.createdAt || p.created_at || p.created || p.happenedAt || null
    );
  });

  const detailTags = computed(() => {
    const p = detail.post || {};
    return Array.isArray(p.tags) ? p.tags : [];
  });

  const detailSubtitle = computed(() => {
    const parts = [t("main_page.body.detail.header.sub_title.uploaded")];
    if (detailDate.value) parts.push(formatDate(detailDate.value));
    if (detailTags.value.length)
      parts.push(detailTags.value.join(" / "));
    return parts.join(" · ") || "—";
  });

  async function deletePost() {
    if (!detail.post?.id) return;
    if (
      JSON.parse(
        localStorage.getItem("whatIveDone_settings") || "{}"
      ).confirmDelete &&
      prompt(t("main_page.body.detail.body.footer.delete_confirm")) !==
        t("main_page.body.detail.body.footer.delete_confirm_text")
    ) {
      alert(t("main_page.body.detail.body.footer.text_wrong"));
      return;
    }
    try {
      await api(`/api/posts/${detail.post.id}`, { method: "DELETE" });
      detail.open = false;
      return true; // 表示删除成功
    } catch (e: any) {
      alert(
        t("post_dealing.delete.fail", {
          error: safeErr(e?.data ?? e),
        })
      );
      return false;
    }
  }

  return {
    detail,
    detailLoading,
    detailError,
    detailDate,
    detailTags,
    detailSubtitle,
    openDetail,
    deletePost,
  };
}
