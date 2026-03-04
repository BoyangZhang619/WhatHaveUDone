/**
 * 全屏编辑器（Composer）
 */
import { computed, inject, provide, nextTick, reactive, ref, watch, type Ref, InjectionKey } from "vue";
import { useI18n } from "vue-i18n";
import { api } from "./useApi";
import { toDatetimeLocal, clampInt, safeErr } from "./useHelpers";

const mode = ref<"create" | "edit">("create");

const COMPOSER_KEY: InjectionKey<ReturnType<typeof useComposer>> = Symbol("Composer");

export function provideComposer(resetAndList: () => Promise<void>) {
  const state = useComposer(resetAndList);
  provide(COMPOSER_KEY, state);
  return state;
}

export function injectComposer() {
  const state = inject(COMPOSER_KEY);
  if (!state) throw new Error("Composer not provided");
  return state;
}

interface UIState {
  previewMode: boolean;
}

interface Draft {
  id: string;
  template: string;
  title: string;
  content: string;
  happenedAt: string;
  durationMin: number | null;
  focus: number | null;
  difficulty: number | null;
  tags: Array<string>;
  goal: string;
  todos: Array<{ text: string; done: boolean }>;
  pinToTop: boolean;
}

interface CreateStatus {
  msg: string;
  kind: string;
}

const DRAFT_KEY = "studylog:draft:v1";

export function useComposer(resetAndList: () => Promise<void>) {
  const { t } = useI18n();

  const composerOpen = ref(false);
  const overlayEl: Ref<HTMLDivElement | null> = ref(null);

  const ui = reactive<UIState>({
    previewMode: false,
  });

  const createLoading = ref(false);
  const createStatus = reactive<CreateStatus>({
    msg: "",
    kind: "muted",
  });

  const draftStatus = ref(
    t(
      "main_page.body.composer_overlay.overlay_sub_title.draft_status.unsaved"
    )
  );

  const draft = reactive<Draft>({
    id: "",
    template: "",
    title: "",
    content: "",
    happenedAt: toDatetimeLocal(new Date()),
    durationMin: 45,
    focus: 3,
    difficulty: 3,
    tags: [],
    goal: "",
    todos: [],
    pinToTop: false,
  });

  const tagInput = ref("");
  const todoInput = ref("");

  function openComposer() {
    if (composerOpen.value) return;
    composerOpen.value = true;
    nextTick(() => {
      try {
        overlayEl.value?.focus?.();
      } catch {
        // noop
      }
    });
  }

  function closeComposer() {
    composerOpen.value = false;
    mode.value = "create";
    resetDraft();
    createStatus.msg = "";
  }

  function setCreateStatus(msg: string, kind: string = "muted") {
    createStatus.msg = String(msg).slice(0, 1000);
    createStatus.kind = kind;
  }

  function addTag(raw: string) {
    const tag = String(raw || "").trim();
    if (!tag) return;
    const safe = tag.slice(0, 24);
    if (!draft.tags.includes(safe)) draft.tags.push(safe);
    tagInput.value = "";
  }

  function removeTag(tag: string) {
    draft.tags = draft.tags.filter((x) => x !== tag);
  }

  function addTodo(raw: string) {
    const text = String(raw || "").trim();
    if (!text) return;
    draft.todos.push({ text: text.slice(0, 120), done: false });
    todoInput.value = "";
  }

  function removeTodo(i: number) {
    draft.todos.splice(i, 1);
  }

  function resetDraft(keepTime = true) {
    const keep = keepTime ? draft.happenedAt : toDatetimeLocal(new Date());
    draft.template = "";
    draft.title = "";
    draft.content = "";
    draft.happenedAt = keep;
    draft.durationMin = 45;
    draft.focus = 3;
    draft.difficulty = 3;
    draft.tags = [];
    draft.goal = "";
    draft.todos = [];
    draft.pinToTop = false;
    ui.previewMode = false;
    setCreateStatus(t("other.draft_clean"), "muted");
  }

  function applyTemplate() {
    const template = draft.template;
    if (!template) return;

    if (!draft.title) {
      const map: Record<string, string> = {
        reciting: t("apply_template.type.reciting"),
        reading: t("apply_template.type.reading"),
        coding: t("apply_template.type.coding"),
        homework: t("apply_template.type.homework"),
        assignment: t("apply_template.type.assignment"),
        course: t("apply_template.type.course"),
        review: t("apply_template.type.review"),
      };
      draft.title = map[template] || "";
    }

    if (!draft.goal) {
      const map: Record<string, string> = {
        reciting: t("apply_template.goal.reciting"),
        reading: t("apply_template.goal.reading"),
        coding: t("apply_template.goal.coding"),
        homework: t("apply_template.goal.homework"),
        assignment: t("apply_template.goal.assignment"),
        course: t("apply_template.goal.course"),
        review: t("apply_template.goal.review"),
      };
      draft.goal = map[template] || "";
    }

    if (!draft.content) {
      const map: Record<string, string> = {
        reciting: t("apply_template.content.reciting"),
        reading: t("apply_template.content.reading"),
        coding: t("apply_template.content.coding"),
        homework: t("apply_template.content.homework"),
        assignment: t("apply_template.content.assignment"),
        course: t("apply_template.content.course"),
        review: t("apply_template.content.review"),
      };
      draft.content = map[template] || "";
    }

    addTag(template);
  }

  const composedPreview = computed(() => {
    const lines = [];
    if (draft.title) lines.push(draft.title);
    lines.push("");

    lines.push(
      t("composed_preview.time", { time: draft.happenedAt || "-" })
    );
    lines.push(
      t("composed_preview.duration", {
        duration: draft.durationMin ?? "-",
      })
    );
    lines.push(
      t("composed_preview.focus_diff", {
        focus: draft.focus,
        diff: draft.difficulty,
      })
    );
    if (draft.tags.length)
      lines.push(
        t("composed_preview.tags", { tags: draft.tags.join(", ") })
      );
    if (draft.goal)
      lines.push(t("composed_preview.target", { goal: draft.goal }));
    lines.push("");
    lines.push(draft.content || "");
    if (draft.todos.length) {
      lines.push("");
      lines.push(
        t("composed_preview.next_step", {
          next_step: draft.todos
            .map((td) => `- [${td.done ? "x" : " "}] ${td.text}`)
            .join("\n"),
        })
      );
    }
    return lines.join("\n");
  });

  const wordCount = computed(() => {
    const s = `${draft.title}\n${draft.goal}\n${draft.content}`.trim();
    if (!s) return 0;
    const cn = (s.match(/[\u4e00-\u9fff]/g) || []).length;
    const en = (s.match(/[A-Za-z0-9_]+/g) || []).length;
    return cn + en;
  });

  // 草稿自动保存
  let draftTimer: ReturnType<typeof setTimeout> | null = null;
  watch(
    () => ({
      ...draft,
      tags: [...draft.tags],
      todos: draft.todos.map((td) => ({ ...td })),
    }),
    () => {
      const settings = localStorage.getItem("whatIveDone_settings");
      if (settings && JSON.parse(settings).autoDraft == false) {
        return;
      }
      if (mode.value === "edit") return; // 编辑模式不保存草稿
      draftStatus.value = t(
        "main_page.body.composer_overlay.overlay_sub_title.draft_status.unsaved"
      );
      if (draftTimer) clearTimeout(draftTimer);
      draftTimer = setTimeout(() => {
        try {
          console.log("Saving draft...", draft);
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft.valueOf()));
          draftStatus.value = t(
            "main_page.body.composer_overlay.overlay_sub_title.draft_status.saved"
          );
        } catch {
          draftStatus.value = t(
            "main_page.body.composer_overlay.overlay_sub_title.draft_status.save_fail"
          );
        }
      }, 350);
    },
    { deep: true }
  );

  async function loadDraft(cardId?: number | null) {
    try {
      const raw = cardId ? await api(`/api/posts/${cardId}`) : localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      mode.value = cardId ? "edit" : "create";
      console.log("mode:", mode.value);
      const obj = cardId?raw?.post:JSON.parse(raw);
      draft.id = obj.id || "";
      draft.template = obj.template || "";
      draft.title = obj.title || "";
      draft.content = obj.content || "";
      draft.happenedAt = obj.happenedAt || toDatetimeLocal(new Date());
      draft.durationMin = clampInt(obj.durationMin, 0, 1440, 45);
      draft.focus = clampInt(obj.focus, 1, 5, 3);
      draft.difficulty = clampInt(obj.difficulty, 1, 5, 3);
      draft.tags = Array.isArray(obj.tags)
        ? obj.tags.slice(0, 20).map((x: any) => String(x).slice(0, 24))
        : [];
      draft.goal = obj.goal || "";
      draft.todos = Array.isArray(obj.todos)
        ? obj.todos
            .slice(0, 30)
            .map((td: any) => ({
              text: String(td.text || "").slice(0, 120),
              done: !!td.done,
            }))
        : [];
      draft.pinToTop = !!obj.pinToTop;

      draftStatus.value = t("main_page.body.composer_overlay.overlay_sub_title.draft_status.loaded");
    } catch {
      // ignore
    }
  }

  async function createPost() {
    if (createLoading.value) return;

    const title = String(draft.title || "")
      .trim()
      .slice(0, 120);
    const content = String(draft.content || "")
      .trim()
      .slice(0, 20000);

    if (!title && !content) {
      setCreateStatus(t("post_dealing.create.no_enough"), "error");
      return;
    }

    createLoading.value = true;
    setCreateStatus(t("post_dealing.create.saving"), "muted");

    const payloadRich = {
      title,
      content,
      happenedAt: draft.happenedAt || null,
      durationMin: draft.durationMin ?? null,
      focus: draft.focus ?? null,
      difficulty: draft.difficulty ?? null,
      tags: draft.tags,
      goal: draft.goal || null,
      todos: draft.todos,
      pinToTop: draft.pinToTop,
    };

    try {
      const data = await api("/api/posts"+ (mode.value === "edit" ? `/${draft.id}` : ""), {
        method: "POST",
        body: JSON.stringify(payloadRich),
      });
      draft.id = "";
      mode.value = "create";
      setCreateStatus(
        t("post_dealing.create.success.total", {
          id: data?.id ?? "?",
        }),
        "success"
      );
      resetDraft(false);
      await resetAndList();
      closeComposer();
    } catch (e: any) {
      const status = e?.status;

      if (
        e?.kind === "http" &&
        (status === 400 || status === 409 || status === 422)
      ) {
        try {
          const data2 = await api("/api/posts", {
            method: "POST",
            body: JSON.stringify({ title, content }),
          });
          setCreateStatus(
            t("post_dealing.create.success.part", {
              id: data2?.id ?? "?",
            }),
            "success"
          );
          resetDraft(false);
          await resetAndList();
          closeComposer();
        } catch (e2: any) {
          setCreateStatus(
            t("post_dealing.create.fail", {
              error: safeErr(e2?.data ?? e2),
            }),
            "error"
          );
        }
      } else {
        setCreateStatus(
          t("post_dealing.create.fail", {
            error: safeErr(e?.data ?? e),
          }),
          "error"
        );
      }
    } finally {
      createLoading.value = false;
    }
  }

  return {
    composerOpen,
    mode,
    overlayEl,
    ui,
    createLoading,
    createStatus,
    draftStatus,
    draft,
    tagInput,
    todoInput,
    openComposer,
    closeComposer,
    setCreateStatus,
    addTag,
    removeTag,
    addTodo,
    removeTodo,
    resetDraft,
    applyTemplate,
    composedPreview,
    wordCount,
    loadDraft,
    createPost,
  };
}
