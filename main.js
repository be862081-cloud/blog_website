function getPosts() {
  try { return JSON.parse(localStorage.getItem("posts")) || []; }
  catch { return []; }
}
function savePosts(posts) {
  localStorage.setItem("posts", JSON.stringify(posts));
}
function esc(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}
function fmt(time) {
  return new Date(time).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit"
  });
}

/* ---------- Quote (public API) ---------- */
async function loadQuote() {
  const q = document.getElementById("quote");
  const a = document.getElementById("author");
  try {
    const res = await fetch("https://dummyjson.com/quotes/random");
    const data = await res.json();
    q.innerHTML = '<em>"' + esc(data.quote) + '"</em>';
    a.textContent = "— " + data.author;
  } catch {
    q.textContent = "Could not load a quote right now.";
    a.textContent = "";
  }
}

/* ---------- Home: latest posts ---------- */
function renderLatest() {
  const box = document.getElementById("latest");
  const posts = getPosts().slice(0, 3);
  if (posts.length === 0) {
    box.innerHTML = '<div class="card meta">No posts yet. Go to the Blog page to write one!</div>';
    return;
  }
  box.innerHTML = posts.map(p => `
    <div class="card">
      <h3>${esc(p.title)}</h3>
      <p class="meta">by ${esc(p.name)} · ${fmt(p.time)}</p>
      <p>${esc(p.body)}</p>
    </div>`).join("");
}

/* ---------- Blog: posts + comments ---------- */
function renderPosts() {
  const box = document.getElementById("posts");
  const posts = getPosts();
  box.innerHTML = posts.map(p => `
    <div class="card">
      <h3>${esc(p.title)}</h3>
      <p class="meta">by ${esc(p.name)} · ${fmt(p.time)}</p>
      <p>${esc(p.body)}</p>
      <hr>
      <strong>Comments</strong>
      ${p.comments.map(c => `
        <div class="comment"><strong>${esc(c.name)}</strong>
        <span class="meta">${fmt(c.time)}</span><br>${esc(c.text)}</div>`).join("")}
      <div class="row">
        <input id="cn-${p.id}" placeholder="Name (optional)">
        <input id="ct-${p.id}" placeholder="Write a comment...">
        <button onclick="addComment(${p.id})">Comment</button>
      </div>
    </div>`).join("");
}

function addPost() {
  const title = document.getElementById("pTitle").value.trim();
  const body = document.getElementById("pBody").value.trim();
  const name = document.getElementById("pName").value.trim() || "Anonymous";
  if (!title || !body) { alert("Please write a title and a message."); return; }
  const posts = getPosts();
  posts.unshift({ id: Date.now(), name, title, body, time: Date.now(), comments: [] });
  savePosts(posts);
  document.getElementById("pTitle").value = "";
  document.getElementById("pBody").value = "";
  renderPosts();
}

function addComment(id) {
  const text = document.getElementById("ct-" + id).value.trim();
  const name = document.getElementById("cn-" + id).value.trim() || "Anonymous";
  if (!text) return;
  const posts = getPosts();
  const post = posts.find(p => p.id === id);
  post.comments.push({ name, text, time: Date.now() });
  savePosts(posts);
  renderPosts();
}

/* ---------- Run the right code for each page ---------- */
if (document.getElementById("quote")) {
  loadQuote();
  document.getElementById("newQuote").addEventListener("click", loadQuote);
}
if (document.getElementById("latest")) renderLatest();
if (document.getElementById("posts")) {
  renderPosts();
  document.getElementById("publish").addEventListener("click", addPost);
}
