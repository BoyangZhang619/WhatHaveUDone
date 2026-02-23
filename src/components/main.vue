<template>
  <div class="main-screen">
    <header class="top-bar">
      <div class="brand">LEARN.LOG</div>
      <div class="nav-actions">
        <button class="icon-btn" @click="$emit('toSettings')" title="设置">
          <span class="icon">⚙</span> 设置
        </button>
        <button class="icon-btn logout" @click="$emit('logout')">登出</button>
      </div>
    </header>

    <main class="content-wrapper">
      <section 
        :class="['create-section', { 'is-expanded': isCreating }]"
        @click="!isCreating && (isCreating = true)"
      >
        <div v-if="!isCreating" class="create-placeholder">
          <span class="plus">+</span>
          <p>记录今天的学习心得...</p>
        </div>

        <div v-else class="create-form" @click.stop>
          <div class="form-header">
            <h3>新的学习记录</h3>
            <button class="close-btn" @click="isCreating = false">✕</button>
          </div>
          
          <div class="form-grid">
            <div class="field">
              <label>主题 / Title</label>
              <input v-model="postForm.title" placeholder="例如：Vue3 响应式原理" />
            </div>
            <div class="field">
              <label>类别 / Category</label>
              <select v-model="postForm.category">
                <option value="code">编程开发</option>
                <option value="lang">语言学习</option>
                <option value="math">数学科学</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="field full">
              <label>详细内容 / Detail</label>
              <textarea v-model="postForm.content" placeholder="记录具体学到了什么..."></textarea>
            </div>
          </div>

          <div class="form-footer">
            <div class="status-msg" :class="status.post.kind">{{ status.post.msg }}</div>
            <button class="btn-save" @click="handleCreate">保存记录</button>
          </div>
        </div>
      </section>

      <section class="list-section">
        <div class="list-header">
          <h3>学习历程</h3>
          <button class="refresh-btn" @click="fetchPosts">刷新</button>
        </div>

        <div class="posts-container">
          <div v-if="posts.length === 0" class="empty-state">尚无记录</div>
          <div v-for="p in posts" :key="p.id" class="post-card">
            <div class="card-meta">
              <span class="id">#{{ p.id }}</span>
              <span class="time">{{ p.created_at || '刚刚' }}</span>
            </div>
            <h4 class="card-title">{{ p.title || '未命名记录' }}</h4>
            <p class="card-preview">{{ p.preview }}</p>
            <div class="card-actions">
              <button @click="viewPost(p.id)">阅读全文</button>
            </div>
          </div>
        </div>

        <div class="pagination">
          <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)"> &lt; </button>
          <button 
            v-for="page in totalPages" 
            :key="page" 
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)"> &gt; </button>
        </div>
      </section>
    </main>

    <transition name="fade">
      <div v-if="selectedPost" class="modal-overlay" @click="selectedPost = null">
        <div class="modal-content" @click.stop>
          <h4>{{ selectedPost.title }}</h4>
          <pre>{{ selectedPost.content }}</pre>
          <button @click="selectedPost = null">关闭</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';

const props = defineProps(['userInfo']);
const emit = defineEmits(['logout', 'toSettings']);

const API_BASE = "https://login.boyangzhang246.workers.dev";
const PAGE_SIZE = 6; // 每页显示数量

// 状态
const isCreating = ref(false);
const posts = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const selectedPost = ref(null);
const status = reactive({ post: { msg: '', kind: '' } });

const postForm = reactive({
  title: '',
  content: '',
  category: 'code'
});

const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE) || 1);

// API 封装
async function api(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const res = await fetch(API_BASE + path, { ...options, headers, credentials: "include" });
  if (!res.ok) throw await res.json();
  return res.json();
}

// 业务逻辑
const fetchPosts = async () => {
  try {
    const offset = (currentPage.value - 1) * PAGE_SIZE;
    const data = await api(`/api/posts?limit=${PAGE_SIZE}&offset=${offset}`);
    posts.value = data.results || [];
    totalCount.value = data.total || 0; // 假设后端返回总数，若无则需自行模拟
  } catch (e) {
    console.error("加载列表失败", e);
  }
};

const handleCreate = async () => {
  status.post.msg = "保存中...";
  try {
    await api("/api/posts", {
      method: "POST",
      body: JSON.stringify({ 
        title: postForm.title, 
        content: `[${postForm.category}] ${postForm.content}` 
      })
    });
    status.post.msg = "保存成功";
    postForm.title = '';
    postForm.content = '';
    setTimeout(() => {
      isCreating.value = false;
      status.post.msg = "";
      fetchPosts();
    }, 800);
  } catch (e) {
    status.post.msg = "失败";
  }
};

const viewPost = async (id) => {
  try {
    const data = await api("/api/posts/" + id);
    selectedPost.value = data.post;
  } catch (e) { alert("读取失败"); }
};

const changePage = (p) => {
  currentPage.value = p;
  fetchPosts();
};

onMounted(fetchPosts);
</script>

<style scoped>
.main-screen {
  width: 100vw;
  min-height: 100vh;
  background: #fff;
  color: #1a1a1a;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* 顶部导航 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid #f0f0f0;
}
.brand { font-weight: 800; letter-spacing: 2px; }
.nav-actions { display: flex; gap: 20px; }
.icon-btn { background: none; border: none; cursor: pointer; color: #666; font-size: 0.9rem; transition: color 0.3s; }
.icon-btn:hover { color: #000; }

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 新增块扩展效果 */
.create-section {
  background: #f9f9f9;
  border-radius: 20px;
  padding: 40px;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 60px;
  border: 1px solid #eee;
  position: relative;
  overflow: hidden;
}

.create-section.is-expanded {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100;
  border-radius: 0;
  background: #fff;
  cursor: default;
  padding: 60px;
}

.create-placeholder {
  text-align: center;
  color: #999;
}
.create-placeholder .plus { font-size: 2rem; display: block; margin-bottom: 10px; }

.create-form { width: 100%; max-width: 700px; margin: 0 auto; }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field.full { grid-column: span 2; }
.field label { display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 8px; color: #888; }
input, textarea, select {
  width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 8px; font-family: inherit;
}
textarea { height: 200px; resize: none; }

.form-footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: center; }
.btn-save { background: #000; color: #fff; border: none; padding: 12px 30px; border-radius: 30px; cursor: pointer; }

/* 列表设计 */
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.posts-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.post-card {
  padding: 25px; border: 1px solid #f0f0f0; border-radius: 12px; transition: transform 0.3s;
}
.post-card:hover { transform: translateY(-5px); border-color: #000; }
.card-meta { font-size: 0.7rem; color: #ccc; margin-bottom: 10px; display: flex; justify-content: space-between; }
.card-title { margin: 0 0 10px 0; font-size: 1.1rem; }
.card-preview { color: #666; font-size: 0.9rem; line-height: 1.5; height: 3em; overflow: hidden; }
.card-actions { margin-top: 15px; }
.card-actions button { background: none; border: none; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline; }

/* 分页 */
.pagination { margin-top: 50px; display: flex; justify-content: center; gap: 10px; }
.pagination button {
  width: 35px; height: 35px; border: 1px solid #eee; background: #fff; border-radius: 50%; cursor: pointer; transition: all 0.3s;
}
.pagination button.active { background: #000; color: #fff; border-color: #000; }
.pagination button:disabled { opacity: 0.3; cursor: not-allowed; }

/* 详情弹窗 */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(255,255,255,0.95); z-index: 200; display: flex; justify-content: center; align-items: center;
}
.modal-content { max-width: 600px; width: 90%; }
pre { white-space: pre-wrap; background: #f5f5f5; padding: 20px; border-radius: 10px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>