// ✅ 跨域：明确写 API 域名
    const API_BASE = "https://login.boyangzhang246.workers.dev";

    async function api(path, options = {}) {
      const headers = options.headers ? { ...options.headers } : {};
      if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      let res;
      try {
        res = await fetch(API_BASE + path, {
          ...options,
          headers,
          credentials: "include",
        });
      } catch (err) {
        // 网络层错误（会是 TypeError）
        throw { kind: "network", message: err?.message || String(err), err };
      }

      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

      if (!res.ok) {
        throw {
          kind: "http",
          status: res.status,
          statusText: res.statusText,
          data,
        };
      }
      return data;
    }

    const $ = (id) => document.getElementById(id);

    function setStatus(el, msg, kind = "muted") {
      el.className = kind;
      el.textContent = msg;
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[c]));
    }

    async function refreshMe() {
      try {
        const data = await api("/api/me");
        setStatus($("authStatus"), "已登录：" + data.user.email, "ok");
        return data.user;
      } catch (e) {
        setStatus($("authStatus"), "未登录 / 会话失效", "muted");
        return null;
      }
    }

    async function listPosts() {
      try {
        const data = await api("/api/posts?limit=20&offset=0");
        const items = data.results || [];
        if (!items.length) {
          $("list").innerHTML = "<p class='muted'>暂无内容</p>";
          return;
        }
        $("list").innerHTML =
          "<ul>" +
          items.map(p =>
            `<li>
            <b>#${p.id}</b> ${escapeHtml(p.title || "(无标题)")}
            <button class="ghost" onclick="viewPost(${p.id})">查看</button>
            <div class="muted">${escapeHtml(p.preview || "")}</div>
          </li>`
          ).join("") +
          "</ul>";
      } catch (e) {
        if (e.kind === "http" && e.status === 401) {
          $("list").innerHTML = "<p class='muted'>未登录，无法加载列表</p>";
          return;
        }
        $("list").innerHTML = `<p class="error">加载失败：${escapeHtml(JSON.stringify(e))}</p>`;
      }
    }

    window.viewPost = async function (id) {
      try {
        const data = await api("/api/posts/" + id);
        $("detail").innerHTML = `<h4>内容 #${id}</h4><pre>${escapeHtml(data.post.content || "")}</pre>`;
      } catch (e) {
        $("detail").innerHTML = `<p class="error">读取失败：${escapeHtml(JSON.stringify(e.data))}</p>`;
      }
    };

    $("btnRegister").onclick = async () => {
      setStatus($("authStatus"), "注册中...");
      try {
        await api("/api/register", {
          method: "POST",
          body: JSON.stringify({ email: $("email").value, password: $("password").value })
        });
        setStatus($("authStatus"), "注册成功（现在可以登录）", "ok");
      } catch (e) {
        setStatus($("authStatus"), "注册失败：" + JSON.stringify(e.data), "error");
      }
    };

    $("btnLogin").onclick = async () => {
      setStatus($("authStatus"), "登录中...");
      try {
        await api("/api/login", {
          method: "POST",
          body: JSON.stringify({ email: $("email").value, password: $("password").value })
        });
        await refreshMe();
        await listPosts();
      } catch (e) {
        setStatus($("authStatus"), "登录失败：" + JSON.stringify(e.data), "error");
      }
    };

    $("btnLogout").onclick = async () => {
      try { await api("/api/logout", { method: "POST" }); } catch { }
      await refreshMe();
      await listPosts();
    };

    $("btnMe").onclick = refreshMe;

    $("btnCreate").onclick = async () => {
      setStatus($("postStatus"), "保存中...");
      try {
        const data = await api("/api/posts", {
          method: "POST",
          body: JSON.stringify({ title: $("title").value, content: $("content").value })
        });
        setStatus($("postStatus"), "已保存 id=" + data.id, "ok");
        $("content").value = "";
        await listPosts();
      } catch (e) {
        setStatus($("postStatus"), "保存失败：" + JSON.stringify(e.data), "error");
      }
    };

    $("btnList").onclick = listPosts;

    // 初始
    refreshMe();
    listPosts();