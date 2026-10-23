const entries = [
  {id:"v1",category:"آيات",title:"زاد التقوى",body:"وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَى",source:"سورة البقرة، الآية 197",note:"آية قرآنية — راجع المصحف للتثبت من الرسم والضبط."},
  {id:"d1",category:"أدعية",title:"دعاء الهداية والثبات",body:"يَا مُقَلِّبَ الْقُلُوبِ، ثَبِّتْ قَلْبِي عَلَى دِينِكَ.",source:"ورد في جامع الترمذي؛ يُراجع التخريج واللفظ قبل النشر.",note:"دعاء مأثور"},
  {id:"w1",category:"وقفات",title:"خطوة صغيرة كل يوم",body:"لا نحتاج أن نكون كاملين حتى نبدأ طريق الإصلاح؛ نحتاج إلى صدق النية وخطوة صغيرة نحو الله، ثم الثبات والاستعانة به.",source:"تأمل تربوي — صياغة تحريرية وليست حديثاً.",note:"وقفة مع النفس"},
  {id:"h1",category:"أحاديث",title:"الكلمة الطيبة",body:"الكلمة الطيبة صدقة.",source:"صحيح البخاري وصحيح مسلم، بمعناه ولفظه في روايات الحديث.",note:"حديث نبوي — يُستحسن مراجعة اللفظ في مصدر معتمد."},
  {id:"p1",category:"تربية",title:"نربي أبناءنا بالقدوة",body:"أبناؤنا يتعلمون من أفعالنا قبل كلماتنا؛ فلنكن قدوة في الصدق والرحمة والرفق، ولنربط النصيحة بالمحبة.",source:"مادة تربوية تحريرية — ليست نصاً شرعياً.",note:"لنربي أبناءنا"},
  {id:"d2",category:"أدعية",title:"دعاء الخير",body:"اللَّهُمَّ أَعِنَّا عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.",source:"سنن أبي داود والنسائي؛ يُراجع التخريج قبل اعتماد النشر.",note:"دعاء مأثور"}
];

const list = document.getElementById("contentList");
const searchInput = document.getElementById("searchInput");
const count = document.getElementById("resultCount");
const empty = document.getElementById("emptyState");
const listTitle = document.getElementById("listTitle");
const dialog = document.getElementById("detailDialog");
let category = "الكل";
let view = "home";
let currentEntry = null;
let deferredInstallPrompt = null;
const favoritesKey = "zad-alakhira-favorites";
const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem(favoritesKey) || "[]"); } catch { return []; }
};
const setFavorites = ids => localStorage.setItem(favoritesKey, JSON.stringify(ids));
const isSaved = id => getFavorites().includes(id);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function toggleSave(id) {
  const favs = getFavorites();
  setFavorites(favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]);
  render();
  if (currentEntry && currentEntry.id === id) updateDetailSave();
}
function shareText(text) {
  if (navigator.share) navigator.share({title:"زاد الآخرة", text}).catch(()=>{});
  else if (navigator.clipboard) navigator.clipboard.writeText(text).then(()=>alert("تم نسخ النص للمشاركة."));
  else alert(text);
}
function render() {
  const q = searchInput.value.trim().toLowerCase();
  let data = entries.filter(e => {
    const matchesCategory = category === "الكل" || e.category === category;
    const matchesView = view !== "favorites" || isSaved(e.id);
    const haystack = `${e.title} ${e.body} ${e.source} ${e.category}`.toLowerCase();
    return matchesCategory && matchesView && (!q || haystack.includes(q));
  });
  list.innerHTML = data.map(e => `
    <article class="content-card">
      <button class="open-card" data-open="${e.id}">
        <div class="meta">${escapeHtml(e.category)} · ${escapeHtml(e.note)}</div>
        <h3>${escapeHtml(e.title)}</h3>
        <p>${escapeHtml(e.body.length > 125 ? e.body.slice(0,125)+"…" : e.body)}</p>
      </button>
      <div class="card-actions">
        <button class="secondary-btn" data-share="${e.id}">مشاركة</button>
        <button class="icon-btn ${isSaved(e.id)?"saved":""}" data-save="${e.id}" aria-label="حفظ">${isSaved(e.id)?"♥":"♡"}</button>
      </div>
    </article>`).join("");
  count.textContent = `${data.length} مواد`;
  empty.hidden = data.length !== 0;
  listTitle.textContent = view === "favorites" ? "المفضلة" : "مختارات إيمانية";
}
function openEntry(id) {
  currentEntry = entries.find(e => e.id === id);
  if (!currentEntry) return;
  document.getElementById("detailCategory").textContent = currentEntry.category;
  document.getElementById("detailTitle").textContent = currentEntry.title;
  document.getElementById("detailBody").textContent = currentEntry.body;
  document.getElementById("detailSource").textContent = currentEntry.source;
  updateDetailSave();
  dialog.showModal();
}
function updateDetailSave() {
  const b = document.getElementById("detailSave");
  if (!currentEntry) return;
  b.textContent = isSaved(currentEntry.id) ? "♥" : "♡";
  b.classList.toggle("saved", isSaved(currentEntry.id));
}
document.querySelectorAll(".category").forEach(b => b.addEventListener("click", () => {
  category = b.dataset.category;
  document.querySelectorAll(".category").forEach(x => x.classList.toggle("active", x === b));
  render();
}));
searchInput.addEventListener("input", render);
list.addEventListener("click", e => {
  const open = e.target.closest("[data-open]");
  const save = e.target.closest("[data-save]");
  const share = e.target.closest("[data-share]");
  if (open) openEntry(open.dataset.open);
  if (save) toggleSave(save.dataset.save);
  if (share) {
    const item = entries.find(x => x.id === share.dataset.share);
    shareText(`${item.title}\n\n${item.body}\n\n${item.source}\n\nزاد الآخرة`);
  }
});
document.getElementById("dailyShare").addEventListener("click", () => shareText("وقفة مع النفس\n\n"+document.getElementById("dailyText").textContent+"\n\nزاد الآخرة"));
document.getElementById("dailySave").addEventListener("click", () => toggleSave("w1"));
document.getElementById("closeDialog").addEventListener("click", () => dialog.close());
document.getElementById("detailShare").addEventListener("click", () => {
  if (currentEntry) shareText(`${currentEntry.title}\n\n${currentEntry.body}\n\n${currentEntry.source}\n\nزاد الآخرة`);
});
document.getElementById("detailSave").addEventListener("click", () => currentEntry && toggleSave(currentEntry.id));
document.querySelectorAll(".nav-item[data-view]").forEach(b => b.addEventListener("click", () => {
  view = b.dataset.view;
  document.querySelectorAll(".nav-item[data-view]").forEach(x => x.classList.toggle("selected", x === b));
  render();
  document.querySelector(".content-section").scrollIntoView({behavior:"smooth",block:"start"});
}));
document.getElementById("shareApp").addEventListener("click", () => shareText("تعرّف على زاد الآخرة — مساحة للتذكير بالله ونشر الخير."));
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  document.getElementById("installBtn").hidden = false;
});
document.getElementById("installBtn").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.getElementById("installBtn").hidden = true;
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
render();
