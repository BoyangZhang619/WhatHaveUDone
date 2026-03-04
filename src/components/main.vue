<template>
  <div class="page">
    <!-- Top bar -->
    <Header @settingOpen="onOpenSettings" @log-out="onLogout" />
    <!-- Body -->
    <main class="content">
      <!-- Create block -->
      <CreateCard />

      <!-- List -->
      <section class="list-area">
        <div class="list-head">
          <div class="list-title">{{ t("main_page.body.list_area.list_title") }}</div>
          <div class="list-tools">
            <button class="btn secondary" @click="listPosts()">{{ t("main_page.body.list_area.select_page.refresh") }}</button>
          </div>
        </div>

        <!-- Card list -->
        <Cards />

        <!-- Pagination -->
        <Pager />
      </section>
    </main>

    <!-- Fullscreen composer -->
    <transition name="overlay">
      <Composer v-if="composerOpen"/>
    </transition>

    <!-- Detail modal -->
    <transition name="neo-pop">
      <Detail v-if="detail.open" @delete-post="deletePost" @edit-post="editPost"/>
    </transition>
  </div>
</template>

<script setup lang="ts">
import Header from "@/partMain/header.vue";
import CreateCard from "@/partMain/createCard.vue";
import Cards from "@/partMain/cards.vue";
import Pager from "@/partMain/pager.vue";
import Composer from "@/partMain/composer.vue";
import Detail from "@/partMain/detail.vue";

import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/composables/useAuth";
import { providePosts } from "@/composables/usePosts";
import { providePostDetail } from "@/composables/usePostDetail";
import { provideComposer } from "@/composables/useComposer";

const { t } = useI18n();
const emit = defineEmits(["log-out", "settingOpen"]);
const { refreshMe, onOpenSettings, onLogout } = useAuth(emit);
const { listPosts, resetAndList } = providePosts();
const { detail, deletePost: _deletePost } = providePostDetail();
const { composerOpen, loadDraft } = provideComposer(resetAndList);

async function deletePost() {
  const success = await _deletePost();
  if (success) await resetAndList();
}

async function editPost() {
  detail.open = false;
  composerOpen.value = true;
  loadDraft(detail.id);
}

onMounted(async () => {
  loadDraft();
  await refreshMe();
  await listPosts();
});
</script>

<style src="@/css/main.css"></style>