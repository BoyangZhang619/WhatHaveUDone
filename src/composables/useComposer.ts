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

  const editDraft = reactive<Draft>({
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
    createStatus.msg = "";
  }

  function setCreateStatus(msg: string, kind: string = "muted") {
    createStatus.msg = String(msg).slice(0, 1000);
    createStatus.kind = kind;
  }

  function addTag(raw: string) {
    const _draft = mode.value === "edit" ? editDraft : draft;
    const tag = String(raw || "").trim();
    if (!tag) return;
    const safe = tag.slice(0, 24);
    if (!_draft.tags.includes(safe)) _draft.tags.push(safe);
    tagInput.value = "";
  }

  function removeTag(tag: string) {
    const _draft = mode.value === "edit" ? editDraft : draft;
    _draft.tags = _draft.tags.filter((x) => x !== tag);
  }

  function addTodo(raw: string) {
    const _draft = mode.value === "edit" ? editDraft : draft;
    const text = String(raw || "").trim();
    if (!text) return;
    _draft.todos.push({ text: text.slice(0, 120), done: false });
    todoInput.value = "";
  }

  function removeTodo(i: number) {
    const _draft = mode.value === "edit" ? editDraft : draft;
    _draft.todos.splice(i, 1);
  }

  function resetDraft(keepTime = true) {
    const _draft = mode.value === "edit" ? editDraft : draft;
    const keep = keepTime ? _draft.happenedAt : toDatetimeLocal(new Date());
    _draft.template = "";
    _draft.title = "";
    _draft.content = "";
    _draft.happenedAt = keep;
    _draft.durationMin = 45;
    _draft.focus = 3;
    _draft.difficulty = 3;
    _draft.tags = [];
    _draft.goal = "";
    _draft.todos = [];
    _draft.pinToTop = false;
    ui.previewMode = false;
    setCreateStatus(t("other.draft_clean"), "muted");
  }

  function applyTemplate() {
    const _draft = mode.value === "edit" ? editDraft : draft;
    const template = _draft.template;
    if (!template) return;

    if (!_draft.title) {
      const map: Record<string, string> = {
        reciting: t("apply_template.type.reciting"),
        reading: t("apply_template.type.reading"),
        coding: t("apply_template.type.coding"),
        homework: t("apply_template.type.homework"),
        assignment: t("apply_template.type.assignment"),
        course: t("apply_template.type.course"),
        review: t("apply_template.type.review"),
      };
      _draft.title = map[template] || "";
    }

    if (!_draft.goal) {
      const map: Record<string, string> = {
        reciting: t("apply_template.goal.reciting"),
        reading: t("apply_template.goal.reading"),
        coding: t("apply_template.goal.coding"),
        homework: t("apply_template.goal.homework"),
        assignment: t("apply_template.goal.assignment"),
        course: t("apply_template.goal.course"),
        review: t("apply_template.goal.review"),
      };
      _draft.goal = map[template] || "";
    }

    if (!_draft.content) {
      const map: Record<string, string> = {
        reciting: t("apply_template.content.reciting"),
        reading: t("apply_template.content.reading"),
        coding: t("apply_template.content.coding"),
        homework: t("apply_template.content.homework"),
        assignment: t("apply_template.content.assignment"),
        course: t("apply_template.content.course"),
        review: t("apply_template.content.review"),
      };
      _draft.content = map[template] || "";
    }

    addTag(template);
  }

  const composedPreview = computed(() => {
    const lines = [];
    const _draft = mode.value === "edit" ? editDraft : draft;
    if (_draft.title) lines.push(_draft.title);
    lines.push("");

    lines.push(
      t("composed_preview.time", { time: _draft.happenedAt || "-" })
    );
    lines.push(
      t("composed_preview.duration", {
        duration: _draft.durationMin ?? "-",
      })
    );
    lines.push(
      t("composed_preview.focus_diff", {
        focus: _draft.focus,
        diff: _draft.difficulty,
      })
    );
    if (_draft.tags.length)
      lines.push(
        t("composed_preview.tags", { tags: _draft.tags.join(", ") })
      );
    if (_draft.goal)
      lines.push(t("composed_preview.target", { goal: _draft.goal }));
    lines.push("");
    lines.push(_draft.content || "");
    if (_draft.todos.length) {
      lines.push("");
      lines.push(
        t("composed_preview.next_step", {
          next_step: _draft.todos
            .map((td) => `- [${td.done ? "x" : " "}] ${td.text}`)
            .join("\n"),
        })
      );
    }
    return lines.join("\n");
  });

  const wordCount = computed(() => {
    const _draft = mode.value === "edit" ? editDraft : draft;
    const s = `${_draft.title}\n${_draft.goal}\n${_draft.content}`.trim();
    if (!s) return 0;
    const cn = (s.match(/[\u4e00-\u9fff]/g) || []).length;
    const en = (s.match(/[A-Za-z0-9_]+/g) || []).length;
    return cn + en;
  });

  // 草稿自动保存
  let draftTimer: ReturnType<typeof setTimeout> | null = null;
  watch(
    // 仅有draft执行保存行为，editDraft不执行（编辑模式不保存草稿），也因此这里不使用_draft
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
    console.log("Loading draft...", { cardId });
    try {
      const raw = cardId ? await api(`/api/posts/${cardId}`) : localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      mode.value = cardId ? "edit" : "create";
      console.log("mode:", mode.value);
      console.log("Raw draft data:", raw.post);
      const obj = cardId?raw.post:JSON.parse(raw);
      const _draft = cardId?editDraft:draft;
      console.log(obj.id)
      _draft.id = obj.id || "";
      _draft.template = obj.template || "";
      _draft.title = obj.title || "";
      _draft.content = obj.content || "";
      _draft.happenedAt = obj.happenedAt || toDatetimeLocal(new Date());
      _draft.durationMin = clampInt(obj.durationMin, 0, 1440, 45);
      _draft.focus = clampInt(obj.focus, 1, 5, 3);
      _draft.difficulty = clampInt(obj.difficulty, 1, 5, 3);
      _draft.tags = Array.isArray(obj.tags)
        ? obj.tags.slice(0, 20).map((x: any) => String(x).slice(0, 24))
        : [];
      _draft.goal = obj.goal || "";
      _draft.todos = Array.isArray(obj.todos)
        ? obj.todos
            .slice(0, 30)
            .map((td: any) => ({
              text: String(td.text || "").slice(0, 120),
              done: !!td.done,
            }))
        : [];
      _draft.pinToTop = !!obj.pinToTop;

      draftStatus.value = t("main_page.body.composer_overlay.overlay_sub_title.draft_status.loaded");
    } catch {
      // ignore
    }
  }

  async function createPost() {
    if (createLoading.value) return;
    const _draft = mode.value === "edit" ? editDraft : draft;
    const title = String(_draft.title || "")
      .trim()
      .slice(0, 120);
    const content = String(_draft.content || "")
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
      happenedAt: _draft.happenedAt || null,
      durationMin: _draft.durationMin ?? null,
      focus: _draft.focus ?? null,
      difficulty: _draft.difficulty ?? null,
      tags: _draft.tags,
      goal: _draft.goal || null,
      todos: _draft.todos,
      pinToTop: _draft.pinToTop,
    };

    try {
      const data = await api("/api/posts"+ (mode.value === "edit" ? `/${_draft.id}` : ""), {
        method: "POST",
        body: JSON.stringify(payloadRich),
      });
      _draft.id = "";
      setCreateStatus(
        t("post_dealing.create.success.total", {
          id: data?.id ?? "?",
        }),
        "success"
      );
      resetDraft();
      mode.value = "create";
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
    editDraft,
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
