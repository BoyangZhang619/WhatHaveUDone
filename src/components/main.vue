<template>
  <div class="page">
    <!-- Top bar -->
    <header class="topbar">
      <div class="brand">
        <div class="brand-dot">
          <span role="img" aria-label="book">📚</span>
        </div>
        <div class="brand-text">
          <div class="brand-title">Study Log</div>
          <div class="brand-sub muted">
            <span v-if="meLoading">{{ t("main_page.header.user_loading") }}</span>
            <span v-else-if="meUser">{{ meUser.email }}</span>
            <span v-else>{{ t("main_page.header.user_load_fail") }}</span>
          </div>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="btn ghost" @click="onOpenSettings">{{ t("main_page.header.settings") }}</button>
        <button class="btn ghost" @click="onLogout">{{ t("main_page.header.logout") }}</button>
      </div>

    </header>

    <!-- Body -->
    <main class="content">
      <!-- Create block -->
      <section class="create-area">
        <div class="create-card" :class="{ compact: !composerOpen }" role="button" tabindex="0" @click="openComposer"
          @keydown.enter.prevent="openComposer" @keydown.space.prevent="openComposer">
          <div class="create-card-left">
            <div class="create-badge">+</div>
            <div>
              <div class="create-title">{{ t("main_page.body.create_block.title") }}</div>
              <div class="muted create-sub">
                {{ t("main_page.body.create_block.create_sub") }}
              </div>
            </div>
          </div>
          <div class="create-card-right">
            <span class="pill">{{ t("main_page.body.create_block.pills.a") }}</span>
            <span class="pill">{{ t("main_page.body.create_block.pills.b") }}</span>
            <span class="pill">{{ t("main_page.body.create_block.pills.c") }}</span>
            <span class="pill">{{ t("main_page.body.create_block.pills.d") }}</span>
          </div>
        </div>
      </section>

      <!-- List -->
      <section class="list-area">
        <div class="list-head">
          <div class="list-title">{{ t("main_page.body.list_area.list_title") }}</div>

          <div class="list-tools">
            <div class="select">
              <!-- <select v-model.number="pager.limit" @change="resetAndList">
                <option :value="3">3</option>
                <option :value="5">5</option>
                <option :value="8">8</option>
                <option :value="13">13</option>
                <option :value="20">20</option>
                <option :value="30">30</option>
              </select> -->
              <!-- <span class="muted">{{ t("main_page.body.list_area.select_page.per_page") }}</span> -->
            </div>
            <button class="btn secondary" @click="listPosts()">{{
              t("main_page.body.list_area.select_page.refresh")
            }}
            </button>
          </div>
        </div>

        <div v-if="listLoading" class="skeleton-wrap">
          <div class="skeleton" v-for="i in 6" :key="i" />
        </div>

        <div v-else-if="listError" class="errorbox">
          {{ t("main_page.body.list_area.errorbox", { error: listError }) }}
        </div>

        <div v-else-if="!posts.length" class="empty">
          <div class="empty-title">{{ t("main_page.body.list_area.empty.empty_title") }}</div>
          <div class="muted">{{ t("main_page.body.list_area.empty.text") }}</div>
          <button class="btn primary" @click="openComposer">{{
            t("main_page.body.list_area.empty.plus")
          }}
          </button>
        </div>

        <div v-else class="cards">
          <article class="post-card" :class="{ 'is-pinned': !!p.pinToTop }" v-for="p in posts" :key="p.id">
            <header class="post-head">
              <div class="post-title">
                <span class="post-id muted">#{{ p.id }}</span>
                <span class="post-title-text">{{
                  p.title ||
                  t("main_page.body.list_area.cards.non-title")
                }}</span>
                <span v-if="p.pinToTop" class="badge">{{
                  t("main_page.body.list_area.cards.pinToTop")
                }}</span>
              </div>

              <div class="post-actions">
                <button class="btn ghost" @click="openDetail(p.id)">{{
                  t("main_page.body.list_area.cards.detail")
                }}
                </button>
              </div>
            </header>

            <div class="post-meta">
              <span v-if="p.happenedAt">{{ formatDate(p.happenedAt) }}</span>

              <span v-if="p.durationMin" class="sep">·</span>
              <span v-if="p.durationMin">{{ p.durationMin }} {{
                t("main_page.body.list_area.cards.min")
              }}</span>

              <span v-if="p.focus != null" class="sep">·</span>
              <span v-if="p.focus != null">{{ t("main_page.body.list_area.cards.focus") }} {{
                p.focus
              }}</span>

              <span v-if="p.difficulty != null" class="sep">·</span>
              <span v-if="p.difficulty != null">{{ t("main_page.body.list_area.cards.diff") }} {{
                p.difficulty
              }}</span>

              <span v-if="p.updated_at" class="sep">·</span>
              <span v-if="p.updated_at">{{ t("main_page.body.list_area.cards.update") }} {{
                formatDate(p.updated_at)
              }}</span>
            </div>

            <section class="post-body">
              <p class="post-preview">
                {{
                  p.preview || p.contentPreview || p.content ||
                  t("main_page.body.list_area.cards.non-content")
                }}
              </p>

              <div v-if="p.goal" class="post-block">
                <div class="post-block-title muted">{{ t("main_page.body.list_area.cards.goal") }}</div>
                <div class="post-block-content">{{ p.goal }}</div>
              </div>

              <div v-if="todoList(p).length" class="post-block">
                <div class="post-block-title muted">
                  {{ t("main_page.body.list_area.cards.todos") }} <span class="muted">({{
                    todoList(p).length
                  }})</span>
                </div>

                <ul class="todo-list" style="justify-content: left !important;">
                  <li v-for="(t, i) in todoList(p).slice(0, 3)" :key="i" class="todo-item">
                    <span class="checkbox" aria-hidden="true"></span>
                    <span class="todo-text">{{ t?.text ?? t }}</span>
                  </li>

                  <li v-if="todoList(p).length > 3" class="todo-more muted">
                    +{{ todoList(p).length - 3 }} {{ t("main_page.body.list_area.cards.more") }}
                  </li>
                </ul>
              </div>
            </section>
            <footer class="post-foot">
              <div class="tag-row" v-if="tagList(p).length">
                <span class="tag" v-for="(t, i) in tagList(p).slice(0, 6)" :key="i">
                  {{ t }}
                </span>
                <span v-if="tagList(p).length > 6" class="tag muted">
                  +{{ tagList(p).length - 6 }}
                </span>
              </div>

              <div class="post-time muted">
                <span v-if="p.created_at">{{ t("main_page.body.list_area.cards.create") }} {{
                  formatDate(p.created_at)
                }}</span>
              </div>
            </footer>
          </article>
        </div>

        <!-- Pagination -->
        <div class="pager" v-if="showPager">
          <button class="btn ghost" :disabled="pager.page <= 1 || listLoading" @click="goPage(pager.page - 1)"
            style="color: var(--text);">
            ‹
          </button>

          <button v-for="it in pageItems" :key="String(it.key)" class="btn"
            :class="{ active: it.type === 'page' && it.value === pager.page }"
            :disabled="it.type !== 'page' || listLoading" @click="it.type === 'page' && goPage(it.value)">
            <span v-if="it.type === 'page'">{{ it.value }}</span>
            <span v-else class="muted">…</span>
          </button>

          <button class="btn ghost" :disabled="!pager.hasNext || listLoading" @click="goPage(pager.page + 1)"
            style="color: var(--text);">
            ›
          </button>

          <div class="pager-right">
            <div class="jump">
              <span class="muted">{{ t("main_page.body.list_area.pagination.jump") }}</span>
              <input v-model="jumpInput" inputmode="numeric" pattern="[0-9]*"
                :placeholder="t('main_page.body.list_area.pagination.pager')" @keydown.enter.prevent="jumpToPage" />
              <button class="btn secondary" @click="jumpToPage" :disabled="listLoading">{{
                t("main_page.body.list_area.pagination.go")
              }}
              </button>
            </div>

            <div class="muted pager-note">
              <span v-if="pager.total != null">{{
                t("main_page.body.list_area.pagination.pages_total", {
                  total: pager.total
                })
              }}</span>
              <span v-else>{{ t("main_page.body.list_area.pagination.pages_total_unknown") }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Fullscreen composer -->
    <transition name="overlay">
      <div v-if="composerOpen" class="overlay" @keydown.esc.prevent="closeComposer" tabindex="-1" ref="overlayEl">
        <div class="overlay-top">
          <div class="overlay-title">
            <div class="overlay-title-main">{{ $t("main_page.body.composer_overlay.overlay_title") }}</div>
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
                  <div class="muted tiny">{{ $t("overlay_rest.left.current") }}{{ draft.difficulty }}</div>
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
                <textarea v-model.trim="draft.content" rows="14" :placeholder="$t('overlay_rest.right.placeholder')"
                  @keydown.ctrl.enter.prevent="createPost" @keydown.meta.enter.prevent="createPost"></textarea>
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
                  <input v-model.trim="todoInput" :placeholder="$t('overlay_rest.right.next_step_placeholder')"
                    @keydown.enter.prevent="addTodo(todoInput)" />
                  <button class="btn secondary" @click="addTodo(todoInput)">{{ $t("overlay_rest.right.add") }}</button>
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
    </transition>

    <!-- Detail modal -->
    <transition name="neo-pop">
      <div v-if="detail.open" class="neoOverlay" role="dialog" aria-modal="true" tabindex="-1"
        @click.self="detail.open = false">
        <section class="neoPanel" @click.stop>
          <!-- Topbar -->
          <header class="neoTop">
            <div class="neoTop__left">
              <div class="neoKicker">
                <span class="neoKicker__id">{{
                  t("main_page.body.detail.header.id", { id: detail.id })
                }}</span>
                <span class="neoKicker__dot">•</span>
                <span v-if="detailLoading" class="neoKicker__muted">{{
                  t("main_page.body.detail.header.loading")
                }}</span>
                <span v-else-if="detailError" class="neoKicker__err">{{ detailError }}</span>
                <span v-else class="neoKicker__muted">{{ detailSubtitle }}</span>
              </div>

              <div class="neoTitleRow">
                <div class="neoTitle">
                  {{ detail.post?.title || t("main_page.body.detail.header.non_title") }}
                </div>

                <div class="neoBadges">
                  <span v-if="detail.post?.pinToTop" class="neoBadge neoBadge--pin">{{
                    t("main_page.body.detail.header.pin")
                  }}</span>
                  <span v-if="detail.post?.goal" class="neoBadge">{{
                    t("main_page.body.detail.header.goal")
                  }}</span>
                </div>
              </div>
            </div>

            <div class="neoTop__right">
              <button class="neoBtn neoBtn--ghost" type="button" @click="detail.open = false">{{
                t("main_page.body.detail.header.close")
              }}
              </button>
            </div>
          </header>

          <!-- Body -->
          <main class="neoBody">
            <!-- Loading -->
            <div v-if="detailLoading" class="neoLoad">
              <div class="neoLoad__bar" v-for="i in 11" :key="i" />
            </div>

            <!-- Error -->
            <div v-else-if="detailError" class="neoError">
              <div class="neoError__title">{{ t("main_page.body.detail.body.error") }}</div>
              <div class="neoError__msg">{{ detailError }}</div>
            </div>

            <!-- Content -->
            <div v-else class="neoWrap">
              <!-- Hero strip -->
              <section class="neoHero">
                <div class="neoHero__left">
                  <div class="neoMetaLine">
                    <span class="neoMeta" v-if="detail.post?.happenedAt || detailDate">
                      {{ t("main_page.body.detail.body.hero_left.start_at") }}{{
                        formatDate(detail.post?.happenedAt || detailDate)
                      }}
                    </span>
                    <span class="neoSep"
                      v-if="(detail.post?.happenedAt || detailDate) && (detail.post?.durationMin != null)">/</span>
                    <span class="neoMeta" v-if="detail.post?.durationMin != null">
                      {{ detail.post.durationMin }} {{
                        t("main_page.body.detail.body.hero_left.min")
                      }}
                    </span>
                  </div>

                  <div class="neoTags" v-if="(detail.post?.tags?.length || detailTags.length)">
                    <span v-for="(t, idx) in (detail.post?.tags?.length ? detail.post.tags : detailTags)"
                      :key="String(t) + '_' + idx" class="neoTag">
                      {{ t }}
                    </span>
                  </div>
                </div>

                <div class="neoHero__right">
                  <div class="neoSwitch" :class="{ 'isOn': !!detail.post?.pinToTop }" aria-hidden="true">
                    <div class="neoSwitch__dot"></div>
                    <div class="neoSwitch__txt">{{
                      detail.post?.pinToTop ?
                        t("main_page.body.detail.body.hero_left.pinned") :
                        t("main_page.body.detail.body.hero_left.normal")
                    }}
                    </div>
                  </div>
                </div>
              </section>

              <!-- Layout: desktop 2 cols, mobile 1 col -->
              <section class="neoGrid">
                <!-- Left: main -->
                <div class="neoMain">
                  <!-- Content card -->
                  <section class="neoCard">
                    <div class="neoCard__hd">
                      <div class="neoCard__title">{{
                        t("main_page.body.detail.body.grid.hd.content")
                      }}
                      </div>
                      <div class="neoCard__side neoMuted" v-if="detail.post?.content?.length">
                        {{ detail.post.content.length }} {{
                          t("main_page.body.detail.body.grid.hd.chars")
                        }}
                      </div>
                    </div>

                    <pre class="neoContent">{{ detail.post?.content || "" }}</pre>
                  </section>

                  <!-- Todos -->
                  <section v-if="(detail.post?.todos?.length || 0) > 0" class="neoCard">
                    <div class="neoCard__hd">
                      <div class="neoCard__title">{{
                        t("main_page.body.detail.body.grid.todos.content")
                      }}
                      </div>
                      <div class="neoCard__side">
                        <span class="neoPill">{{ detail.post.todos.length }}</span>
                      </div>
                    </div>

                    <ul class="neoTodos">
                      <li v-for="(todo, i) in detail.post.todos" :key="i" class="neoTodo"
                        :class="{ isDone: typeof todo === 'object' ? !!todo?.done : false }">
                        <span class="neoTodo__box" aria-hidden="true"></span>
                        <div class="neoTodo__txt">
                          {{ typeof todo === "object" ? (todo?.text ?? "") : todo }}
                        </div>
                      </li>
                    </ul>
                  </section>
                </div>

                <!-- Right: sidebar -->
                <aside class="neoSide">
                  <!-- Gauges -->
                  <section class="neoCard">
                    <div class="neoCard__hd">
                      <div class="neoCard__title">{{
                        t("main_page.body.detail.body.grid.sidebar.card_A.title")
                      }}
                      </div>
                      <div class="neoCard__side neoMuted">{{
                        t("main_page.body.detail.body.grid.sidebar.card_A.visualization")
                      }}
                      </div>
                    </div>

                    <div class="neoGauges">
                      <div class="neoGauge" :style="{
                        '--p': detail.post?.focus != null ? Math.min(100, Math.max(0, (Number(detail.post.focus) / 5) * 100)) : 0
                      }">
                        <div class="neoGauge__ring" aria-hidden="true"></div>
                        <div class="neoGauge__txt">
                          <div class="neoGauge__num">{{ detail.post?.focus ?? "—" }}</div>
                          <div class="neoGauge__cap neoMuted">{{
                            t("main_page.body.detail.body.grid.sidebar.card_A.focus")
                          }}
                          </div>
                        </div>
                      </div>

                      <div class="neoGauge" :style="{
                        '--p': detail.post?.difficulty != null ? Math.min(100, Math.max(0, (Number(detail.post.difficulty) / 5) * 100)) : 0
                      }">
                        <div class="neoGauge__ring" aria-hidden="true"></div>
                        <div class="neoGauge__txt">
                          <div class="neoGauge__num">{{ detail.post?.difficulty ?? "—" }}
                          </div>
                          <div class="neoGauge__cap neoMuted">{{
                            t("main_page.body.detail.body.grid.sidebar.card_A.diff")
                          }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="neoTape">
                      <div class="neoTape__top">
                        <div class="neoTape__label neoMuted">{{
                          t("main_page.body.detail.body.grid.sidebar.card_A.duration")
                        }}
                        </div>
                        <div class="neoTape__value">{{
                          detail.post?.durationMin != null ?
                            (detail.post.durationMin + " " +
                              t("main_page.body.detail.body.grid.sidebar.card_A.min")) : "—"
                        }}
                        </div>
                      </div>

                      <div class="neoTape__track" aria-hidden="true">
                        <div class="neoTape__fill" :style="{
                          width:
                            detail.post?.durationMin != null
                              ? Math.min(100, Math.max(0, (Number(detail.post.durationMin) / 180) * 100)) + '%'
                              : '0%'
                        }" />
                      </div>
                      <div class="neoTape__hint neoMuted">{{
                        detail.post?.durationMin != null ?
                          (detail.post.durationMin + " / 180 " +
                            t("main_page.body.detail.body.grid.sidebar.card_A.min")) :
                          t("main_page.body.detail.body.grid.sidebar.card_A.no_data")
                      }}
                      </div>
                    </div>
                  </section>

                  <!-- Goal + Raw fields -->
                  <section class="neoCard">
                    <div class="neoCard__hd">
                      <div class="neoCard__title">{{
                        t("main_page.body.detail.body.grid.sidebar.card_B.title")
                      }}
                      </div>
                    </div>
                    <div class="neoText">
                      {{ detail.post?.goal || "—" }}
                    </div>

                    <div class="neoDivider"></div>

                    <ul class="neoKV">
                      <li class="neoKV__row">
                        <span class="neoKV__k">{{
                          t("main_page.body.detail.body.grid.sidebar.card_B.happened_at")
                        }}</span>
                        <span class="neoKV__v">{{
                          detail.post?.happenedAt ?
                            formatDate(detail.post.happenedAt) : "—"
                        }}</span>
                      </li>
                      <li class="neoKV__row">
                        <span class="neoKV__k">{{
                          t("main_page.body.detail.body.grid.sidebar.card_B.duration")
                        }}</span>
                        <span class="neoKV__v">{{ detail.post?.durationMin ?? "—" }}</span>
                      </li>
                      <li class="neoKV__row">
                        <span class="neoKV__k">{{
                          t("main_page.body.detail.body.grid.sidebar.card_B.focus")
                        }}</span>
                        <span class="neoKV__v">{{ detail.post?.focus ?? "—" }}</span>
                      </li>
                      <li class="neoKV__row">
                        <span class="neoKV__k">{{
                          t("main_page.body.detail.body.grid.sidebar.card_B.diff")
                        }}</span>
                        <span class="neoKV__v">{{ detail.post?.difficulty ?? "—" }}</span>
                      </li>
                      <li class="neoKV__row">
                        <span class="neoKV__k">{{
                          t("main_page.body.detail.body.grid.sidebar.card_B.pin_to_top")
                        }}</span>
                        <span class="neoKV__v">{{
                          detail.post?.pinToTop ?
                            t("main_page.body.detail.body.grid.sidebar.card_B.pin_status.true")
                            :
                            t("main_page.body.detail.body.grid.sidebar.card_B.pin_status.false")
                        }}</span>
                      </li>
                    </ul>
                  </section>
                </aside>
              </section>
            </div>
          </main>
          <footer class="neoFooter">
            <button @click="deletePost" class="neoFooter_button">{{
              t("main_page.body.detail.body.footer.delete")
            }}
            </button>
          </footer>
        </section>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
/**
 * 主页面 — 逻辑已抽离到 composables，这里只做组装
 */
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/composables/useAuth";
import { usePosts } from "@/composables/usePosts";
import { usePostDetail } from "@/composables/usePostDetail";
import { useComposer } from "@/composables/useComposer";
import { formatDate, tagList, todoList } from "@/composables/useHelpers";

const { t } = useI18n();
const emit = defineEmits(["log-out", "settingOpen"]);

const { meUser, meLoading, refreshMe, onOpenSettings, onLogout } = useAuth(emit);

const {
  posts, listLoading, listError, pager, jumpInput,
  listPosts, resetAndList, goPage, jumpToPage,
  showPager, totalPages, pageItems,
} = usePosts();

const {
  detail, detailLoading, detailError, detailDate, detailTags, detailSubtitle,
  openDetail, deletePost: _deletePost,
} = usePostDetail();

async function deletePost() {
  const success = await _deletePost();
  if (success) await resetAndList();
}

const {
  composerOpen, overlayEl, ui, createLoading, createStatus, draftStatus,
  draft, tagInput, todoInput,
  openComposer, closeComposer, setCreateStatus,
  addTag, removeTag, addTodo, removeTodo,
  resetDraft, applyTemplate, composedPreview, wordCount,
  loadDraft, createPost,
} = useComposer(resetAndList);

onMounted(async () => {
  loadDraft();
  await refreshMe();
  await listPosts();
});
</script>

<style src="@/css/main.css"></style>