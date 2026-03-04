<template>
        <div v-if="composerOpen" class="overlay" @keydown.esc.prevent="closeComposer" tabindex="-1" ref="overlayEl">
            <div class="overlay-top">
                <div class="overlay-title">
                    <div class="overlay-title-main">{{mode === "edit" ? $t("main_page.body.composer_overlay.overlay_edit") : $t("main_page.body.composer_overlay.overlay_title") }}</div>
                    <div class="muted overlay-title-sub">
                        {{ $t("main_page.body.composer_overlay.overlay_sub_title.draft") }}：{{ draftStatus }}
                        <span class="dot">·</span>
                        {{ $t("main_page.body.composer_overlay.overlay_sub_title.wordCount") }}：{{ wordCount }}
                    </div>
                </div>

                <div class="overlay-actions">
                    <button class="btn ghost" @click="resetDraft(false)">{{
                        $t("main_page.body.composer_overlay.overlay_actions.reset")
                        }}
                    </button>
                    <button class="btn ghost" @click="closeComposer">{{
                        $t("main_page.body.composer_overlay.overlay_actions.close")
                        }}
                    </button>
                    <button class="btn primary" :disabled="createLoading" @click="createPost">
                        {{
                            createLoading ? $t("main_page.body.composer_overlay.overlay_actions.save.saving") :
                                $t("main_page.body.composer_overlay.overlay_actions.save.to_save")
                        }}
                    </button>
                </div>
            </div>

            <div class="overlay-body">
                <div class="grid">
                    <!-- Left column -->
                    <div class="panel">
                        <div class="panel-head">
                            <div class="panel-title">{{
                                $t("main_page.body.composer_overlay.overlay_body.left_column.panel_head.title")
                                }}
                            </div>
                            <div class="panel-tools">
                                <select v-model="draft.template" @change="applyTemplate" class="mini-select">
                                    <option value="">-</option>
                                    <option value="reciting">{{ $t("apply_template.type.reciting") }}</option>
                                    <option value="reading">{{ $t("apply_template.type.reading") }}</option>
                                    <option value="coding">{{ $t("apply_template.type.coding") }}</option>
                                    <option value="homework">{{ $t("apply_template.type.homework") }}</option>
                                    <option value="assignment">{{ $t("apply_template.type.assignment") }}</option>
                                    <option value="course">{{ $t("apply_template.type.course") }}</option>
                                    <option value="review">{{ $t("apply_template.type.review") }}</option>
                                </select>

                                <label class="toggle">
                                    <input type="checkbox" v-model="draft.pinToTop" />
                                    <span>{{
                                        $t("main_page.body.composer_overlay.overlay_body.left_column.panel_head.pin")
                                        }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="field">
                            <label>{{ $t("overlay_rest.left.title") }}</label>
                            <input v-model.trim="draft.title" maxlength="120"
                                :placeholder="$t('overlay_rest.left.title_placeholder')" />
                            <div class="muted tiny">{{ $t("overlay_rest.left.suggest") }}</div>
                        </div>

                        <div class="row">
                            <div class="field">
                                <label>{{ $t("overlay_rest.left.time") }}</label>
                                <input v-model="draft.happenedAt" type="datetime-local" />
                            </div>
                            <div class="field">
                                <label>{{ $t("overlay_rest.left.duration") }}</label>
                                <input v-model.number="draft.durationMin" type="number" min="0" max="1440"
                                    :placeholder="$t('overlay_rest.left.duration_placeholder')" />
                            </div>
                        </div>

                        <div class="row">
                            <div class="field">
                                <label>{{ $t("overlay_rest.left.focus") }}</label>
                                <input v-model.number="draft.focus" type="range" min="1" max="5" step="0.05" />
                                <div class="muted tiny">{{ $t("overlay_rest.left.current") }}{{ draft.focus }}</div>
                            </div>
                            <div class="field">
                                <label>{{ $t("overlay_rest.left.diff") }}</label>
                                <input v-model.number="draft.difficulty" type="range" min="1" max="5" step="0.05" />
                                <div class="muted tiny">{{ $t("overlay_rest.left.current") }}{{ draft.difficulty }}
                                </div>
                            </div>
                        </div>

                        <div class="field">
                            <label>{{ $t("overlay_rest.left.tag_plus") }}</label>
                            <div class="tagbox">
                                <div>
                                    <span class="tag" v-for="t in draft.tags" :key="t">
                                        {{ t }}
                                        <button class="tag-x" @click="removeTag(t)" aria-label="remove">×</button>
                                    </span>
                                </div>
                                <input v-model.trim="tagInput" :placeholder="$t('overlay_rest.left.tag_placeholder')"
                                    @keydown.enter.prevent="addTag(tagInput)" @keydown.,.prevent="addTag(tagInput)" />
                            </div>

                            <div class="quick-tags">
                                <button class="btn chip" @click="addTag('reading')">reading</button>
                                <button class="btn chip" @click="addTag('coding')">coding</button>
                                <button class="btn chip" @click="addTag('notes')">notes</button>
                                <button class="btn chip" @click="addTag('review')">review</button>
                            </div>
                        </div>

                        <div class="field">
                            <label>{{ $t("overlay_rest.left.target") }}</label>
                            <textarea v-model.trim="draft.goal" rows="3"
                                :placeholder="$t('overlay_rest.left.placeholder')"></textarea>
                        </div>
                    </div>

                    <!-- Right column -->
                    <div class="panel">
                        <div class="panel-head">
                            <div class="panel-title">{{ $t("overlay_rest.right.content") }}</div>
                            <div class="panel-tools">
                                <label class="toggle">
                                    <input type="checkbox" v-model="ui.previewMode" />
                                    <span>{{ $t("overlay_rest.right.preview_on") }}</span>
                                </label>
                            </div>
                        </div>

                        <div class="field" v-if="!ui.previewMode">
                            <label>{{ $t("overlay_rest.right.title") }}</label>
                            <textarea v-model.trim="draft.content" rows="14"
                                :placeholder="$t('overlay_rest.right.placeholder')"
                                @keydown.ctrl.enter.prevent="createPost"
                                @keydown.meta.enter.prevent="createPost"></textarea>
                            <div class="muted tiny">
                                {{ $t("overlay_rest.right.suggest") }}
                            </div>
                        </div>

                        <div class="field" v-else>
                            <label>{{ $t("overlay_rest.right.preview") }}</label>
                            <pre class="preview">{{ composedPreview }}</pre>
                        </div>

                        <div class="field">
                            <label>{{ $t("overlay_rest.right.next_step") }}</label>
                            <div class="todo">
                                <input v-model.trim="todoInput"
                                    :placeholder="$t('overlay_rest.right.next_step_placeholder')"
                                    @keydown.enter.prevent="addTodo(todoInput)" />
                                <button class="btn secondary" @click="addTodo(todoInput)">{{
                                    $t("overlay_rest.right.add") }}</button>
                            </div>

                            <ul class="todo-list" v-if="draft.todos.length">
                                <li v-for="(t, i) in draft.todos" :key="i">
                                    <input type="checkbox" v-model="t.done" />
                                    <span :class="{ done: t.done }">{{ t.text }}</span>
                                    <button class="btn ghost tinybtn" @click="removeTodo(i)">{{
                                        $t("overlay_rest.right.remove")
                                        }}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div v-if="createStatus.msg" class="status-msg" :class="createStatus.kind">
                            {{ createStatus.msg }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="overlay-bottom muted">
                <span>{{ t("overlay_rest.footer.a") }}</span>
                <span class="dot">·</span>
                <span>{{ t("overlay_rest.footer.b") }}</span>
                <span class="dot">·</span>
                <span>{{ t("overlay_rest.footer.c") }}</span>
            </div>
        </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { injectComposer } from "@/composables/useComposer";

const { t } = useI18n();
const {
  composerOpen, overlayEl, ui, createLoading, createStatus, draftStatus,
  draft, tagInput, todoInput, mode,
  openComposer, closeComposer, setCreateStatus,
  addTag, removeTag, addTodo, removeTodo,
  resetDraft, applyTemplate, composedPreview, wordCount,
  loadDraft, createPost,
} = injectComposer();
</script>