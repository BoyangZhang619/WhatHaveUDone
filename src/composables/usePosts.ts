/**
 * 帖子列表 & 分页
 */
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { api } from "./useApi";
import { safeErr, normalizeInt } from "./useHelpers";

interface Post {
  id: number;
  title: string;
  content: string;
  tags?: string;
  todos?: string;
  happenedAt?: string;
  durationMin?: number;
  focus?: number;
  difficulty?: number;
  pinToTop?: boolean;
  created_at?: string;
  updated_at?: string;
  preview?: string;
  contentPreview?: string;
  goal?: string;
}

interface Pager {
  limit: number;
  offset: number;
  page: number;
  total: number | null;
  hasNext: boolean;
}

export function usePosts() {
  const { t } = useI18n();

  const posts = ref<Post[]>([]);
  const listLoading = ref(false);
  const listError = ref("");
  const userDevice = ref(navigator.userAgent);

  let _savedSettings: any = {};
  try {
    const _raw = localStorage.getItem("whatIveDone_settings");
    _savedSettings = _raw ? JSON.parse(_raw) : {};
  } catch {
    _savedSettings = {};
  }

  const pager = reactive<Pager>({
    limit:
      _savedSettings?.pageSize != null
        ? Number(_savedSettings.pageSize)
        : userDevice.value.includes("Mobile")
          ? 3
          : 5,
    offset: 0,
    page: 1,
    total: null,
    hasNext: false,
  });

  const jumpInput = ref("");

  async function listPosts() {
    listLoading.value = true;
    listError.value = "";

    try {
      const data = await api(
        `/api/posts?limit=${pager.limit}&offset=${pager.offset}`
      );

      let items = data?.results || [];
      if (items.length) {
        const sortType: string =
          JSON.parse(
            localStorage.getItem("whatIveDone_settings") || "{}"
          ).sortOrder || "by_time_desc";
        switch (sortType) {
          case "pin":
            items = items.sort(
              (a: any, b: any) => b.pinToTop - a.pinToTop
            );
            break;
          case "newest":
            break;
          case "oldest":
            items = items.reverse();
            break;
          case "duration":
            items = items.sort(
              (a: any, b: any) =>
                (b.durationMin || 0) - (a.durationMin || 0)
            );
            break;
          default:
        }
      }

      posts.value = items;
      pager.total = data?.posts_count;
      pager.hasNext =
        typeof data?.hasNext === "boolean"
          ? data.hasNext
          : items.length === pager.limit;
      pager.page = Math.floor(pager.offset / pager.limit) + 1;
    } catch (e: any) {
      if (e?.kind === "http" && e.status === 401) {
        listError.value = t("other.list_error");
        posts.value = [];
        pager.total = null;
        pager.hasNext = false;
        return;
      }
      listError.value = safeErr(e);
    } finally {
      listLoading.value = false;
    }
  }

  function resetAndList() {
    pager.offset = 0;
    pager.page = 1;
    pager.hasNext = false;
    return listPosts();
  }

  function goPage(pageNum: number | null | undefined) {
    if (pageNum === null || pageNum === undefined) return;
    const p = Math.max(1, normalizeInt(pageNum, 1));
    pager.page = p;
    pager.offset = (p - 1) * pager.limit;
    return listPosts();
  }

  function jumpToPage() {
    const p = Math.max(1, normalizeInt(jumpInput.value, pager.page));
    jumpInput.value = "";
    return goPage(p);
  }

  const showPager = computed(() => {
    if (pager.total != null && pager.total !== 0)
      return Math.ceil(pager.total / pager.limit) > 1;
    return pager.page > 1 || pager.hasNext;
  });

  function buildPageItems(
    current: number,
    totalPages: number | null,
    hasNext: boolean
  ) {
    const items: Array<{
      type: "page" | "ellipsis";
      value?: number;
      key: string;
    }> = [];
    const key = (t: string, v: any) => `${t}:${v}`;
    const pushPage = (v: number) =>
      items.push({ type: "page", value: v, key: key("p", v) });
    const pushEllipsis = (id: string) =>
      items.push({ type: "ellipsis", key: key("e", id) });

    if (totalPages == null) {
      pushPage(current);
      if (hasNext) pushEllipsis("r");
      return items;
    }

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pushPage(i);
      return items;
    }

    const last = totalPages;

    if (current <= 2) {
      pushPage(1);
      pushPage(2);
      pushEllipsis("r");
      pushPage(last);
    } else if (current >= last - 1) {
      pushPage(1);
      pushEllipsis("l");
      pushPage(last - 1);
      pushPage(last);
    } else {
      pushPage(1);
      pushEllipsis("l");
      pushPage(current);
      pushPage(last);
    }

    return items;
  }

  const totalPages = computed(() => {
    if (pager.total == null) return null;
    return Math.max(1, Math.ceil(pager.total / pager.limit));
  });

  const pageItems = computed(() =>
    buildPageItems(pager.page, totalPages.value, pager.hasNext)
  );

  return {
    posts,
    listLoading,
    listError,
    pager,
    jumpInput,
    listPosts,
    resetAndList,
    goPage,
    jumpToPage,
    showPager,
    totalPages,
    pageItems,
  };
}
