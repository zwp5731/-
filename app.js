const STORAGE_KEY = "kid_planner_data_v4";

const CATEGORY_META = {
  learning: { label: "学习", icon: "📘", cls: "cat-learning" },
  sports: { label: "体育", icon: "⚽", cls: "cat-sports" },
  travel: { label: "旅游", icon: "✈️", cls: "cat-travel" },
  art: { label: "艺术", icon: "🎨", cls: "cat-art" },
  social: { label: "社交", icon: "🎉", cls: "cat-social" }
};

const WEEK_NAMES = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
const WEEK_HEADER = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const state = {
  view: "today",
  calendarMode: "month",
  cursorDate: new Date(),
  selectedDate: new Date(),
  schedules: [],
  attachments: [],
  profile: {
    height: "",
    weight: "",
    shoe: "",
    gifts: [],
    likes: 0
  },
  reminderTimers: []
};

const el = {
  tabs: document.getElementById("tabs"),
  views: {
    today: document.getElementById("view-today"),
    calendar: document.getElementById("view-calendar"),
    files: document.getElementById("view-files"),
    settings: document.getElementById("view-settings")
  },
  travelBanner: document.getElementById("travelBanner"),
  quickAddBtn: document.getElementById("quickAddBtn"),
  openCreateBtn: document.getElementById("openCreateBtn"),
  todayList: document.getElementById("todayList"),
  calendarMode: document.getElementById("calendarMode"),
  calendarTitle: document.getElementById("calendarTitle"),
  selectedDateTitle: document.getElementById("selectedDateTitle"),
  weekdayHeader: document.getElementById("weekdayHeader"),
  calendarGrid: document.getElementById("calendarGrid"),
  calendarEventsPanel: document.getElementById("calendarEventsPanel"),
  prevRange: document.getElementById("prevRange"),
  nextRange: document.getElementById("nextRange"),
  scheduleDialog: document.getElementById("scheduleDialog"),
  scheduleForm: document.getElementById("scheduleForm"),
  scheduleId: document.getElementById("scheduleId"),
  dialogTitle: document.getElementById("dialogTitle"),
  titleInput: document.getElementById("titleInput"),
  descInput: document.getElementById("descInput"),
  categoryInput: document.getElementById("categoryInput"),
  startInput: document.getElementById("startInput"),
  endInput: document.getElementById("endInput"),
  reminderInput: document.getElementById("reminderInput"),
  scheduleFileInput: document.getElementById("scheduleFileInput"),
  currentAttachments: document.getElementById("currentAttachments"),
  fileDialog: document.getElementById("fileDialog"),
  fileForm: document.getElementById("fileForm"),
  uploadFileBtn: document.getElementById("uploadFileBtn"),
  fileUploadInput: document.getElementById("fileUploadInput"),
  fileCategoryInput: document.getElementById("fileCategoryInput"),
  fileScheduleLinkInput: document.getElementById("fileScheduleLinkInput"),
  fileCategoryFilter: document.getElementById("fileCategoryFilter"),
  fileSearchInput: document.getElementById("fileSearchInput"),
  fileList: document.getElementById("fileList"),
  linkDialog: document.getElementById("linkDialog"),
  linkForm: document.getElementById("linkForm"),
  linkFileId: document.getElementById("linkFileId"),
  linkScheduleInput: document.getElementById("linkScheduleInput"),
  heightInput: document.getElementById("heightInput"),
  weightInput: document.getElementById("weightInput"),
  shoeInput: document.getElementById("shoeInput"),
  giftsInput: document.getElementById("giftsInput"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  likeBtn: document.getElementById("likeBtn"),
  likeCount: document.getElementById("likeCount"),
  redeemCostInput: document.getElementById("redeemCostInput"),
  redeemBtn: document.getElementById("redeemBtn"),
  plusOneFx: document.getElementById("plusOneFx"),
  likeFxLayer: document.getElementById("likeFxLayer")
};

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function fmtDateTime(v) {
  const d = new Date(v);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function fmtDate(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

function formatCnDateWithWeek(dateLike) {
  const d = new Date(dateLike);
  const w = WEEK_NAMES[(d.getDay() + 6) % 7];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · ${w}`;
}

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function isDateInSchedule(dateObj, s) {
  const dayStart = new Date(dateObj);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateObj);
  dayEnd.setHours(23, 59, 59, 999);
  const start = new Date(s.startAt);
  const end = new Date(s.endAt);
  return start <= dayEnd && end >= dayStart;
}

function toInputDateTime(d) {
  const t = new Date(d);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}T${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}

function parseYmd(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function catMeta(cat) {
  return CATEGORY_META[cat] || CATEGORY_META.learning;
}

function dogMiniSvg() {
  return `<svg viewBox="0 0 120 120" class="dog-mini" aria-hidden="true"><circle cx="60" cy="60" r="35" /><path d="M38 42 C30 28, 12 32, 20 52" /><path d="M82 42 C90 28, 108 32, 100 52" /><circle cx="48" cy="60" r="3" /><circle cx="72" cy="60" r="3" /><path d="M60 62 L55 70 L65 70 Z" /><path d="M52 77 Q60 84 68 77" /></svg>`;
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    seed();
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state.schedules = (parsed.schedules || []).map((s) => ({ ...s, category: s.category || "learning" }));
    state.attachments = parsed.attachments || [];
    state.profile = {
      height: parsed.profile?.height || "",
      weight: parsed.profile?.weight || "",
      shoe: parsed.profile?.shoe || "",
      gifts: Array.isArray(parsed.profile?.gifts) ? parsed.profile.gifts : [],
      likes: Number(parsed.profile?.likes || 0)
    };
  } catch {
    seed();
  }
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      schedules: state.schedules,
      attachments: state.attachments,
      profile: state.profile
    })
  );
}

function seed() {
  const now = new Date();
  const start1 = new Date(now);
  start1.setHours(8, 30, 0, 0);
  const end1 = new Date(now);
  end1.setHours(9, 0, 0, 0);

  const start2 = new Date(now);
  start2.setHours(15, 30, 0, 0);
  const end2 = new Date(now);
  end2.setHours(17, 0, 0, 0);

  const start3 = new Date(now);
  start3.setDate(start3.getDate() + 1);
  start3.setHours(18, 0, 0, 0);
  const end3 = new Date(start3);
  end3.setDate(end3.getDate() + 2);
  end3.setHours(9, 0, 0, 0);

  state.schedules = [
    {
      id: uid("sch"),
      title: "晨读时间",
      description: "亲子共读绘本 20 分钟",
      category: "learning",
      startAt: start1.toISOString(),
      endAt: end1.toISOString(),
      reminder: "10",
      attachmentIds: []
    },
    {
      id: uid("sch"),
      title: "足球训练",
      description: "记得带水壶和毛巾",
      category: "sports",
      startAt: start2.toISOString(),
      endAt: end2.toISOString(),
      reminder: "30",
      attachmentIds: []
    },
    {
      id: uid("sch"),
      title: "夏令营旅行",
      description: "跨天示例：准备换洗衣物与学习材料",
      category: "travel",
      startAt: start3.toISOString(),
      endAt: end3.toISOString(),
      reminder: "1440",
      attachmentIds: []
    }
  ];
  state.attachments = [];
  state.profile = {
    height: "125",
    weight: "26",
    shoe: "31",
    gifts: ["小狗玩偶", "科学实验盒"],
    likes: 6
  };
  save();
}

function switchView(view) {
  state.view = view;
  [...el.tabs.querySelectorAll(".tab")].forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  Object.entries(el.views).forEach(([k, node]) => node.classList.toggle("active", k === view));
  render();
}

function getTodaySchedules() {
  const now = new Date();
  return state.schedules
    .filter((s) => isDateInSchedule(now, s))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
}

function scheduleCard(s) {
  const attached = state.attachments.filter((a) => (s.attachmentIds || []).includes(a.id));
  const isCrossDay = !isSameDay(s.startAt, s.endAt);
  const meta = catMeta(s.category);
  return `
    <article class="card">
      <div class="event-list-head">
        <h4>${escapeHtml(s.title)}</h4>
        <div class="chips">
          <span class="chip category-chip ${meta.cls}">${meta.icon} ${meta.label}</span>
          <span class="chip">附件 ${attached.length}</span>
        </div>
      </div>
      <div class="meta">${fmtDateTime(s.startAt)} - ${fmtDateTime(s.endAt)} ${isCrossDay ? "（跨天）" : ""}</div>
      <div class="muted">${escapeHtml(s.description || "无描述")}</div>
      <div class="chips">${attached.map((a) => `<span class="chip">${escapeHtml(a.name)}</span>`).join("") || '<span class="chip">暂无附件</span>'}</div>
      <div class="two-actions">
        <span>${dogMiniSvg()}</span>
        <button class="link-btn" data-action="view-attachments" data-id="${s.id}">查看附件</button>
        <button class="link-btn" data-action="edit-schedule" data-id="${s.id}">编辑</button>
        <button class="link-btn" data-action="delete-schedule" data-id="${s.id}">删除</button>
      </div>
    </article>
  `;
}

function renderWeekdayHeader() {
  el.weekdayHeader.innerHTML = WEEK_HEADER.map((w) => `<div class="weekday-cell">${w}</div>`).join("");
}

function renderToday() {
  const list = getTodaySchedules();
  const hasTravel = list.some((s) => s.category === "travel");
  el.travelBanner.classList.toggle("hidden", !hasTravel);

  if (list.length === 0) {
    el.todayList.innerHTML = `
      <div class="card dog-empty">
        ${dogMiniSvg()}
        <div>
          <h4>今天没有安排</h4>
          <p class="muted">小狗说：今天可以自由玩耍啦。</p>
        </div>
      </div>
    `;
    return;
  }
  el.todayList.innerHTML = list.map(scheduleCard).join("");
}

function renderCalendar() {
  const mode = state.calendarMode;
  const cursor = new Date(state.cursorDate);
  el.calendarGrid.innerHTML = "";
  renderWeekdayHeader();
  el.selectedDateTitle.textContent = formatCnDateWithWeek(state.selectedDate);

  if (mode === "month") {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    el.calendarTitle.textContent = `${year}年${month + 1}月`;

    const first = new Date(year, month, 1);
    const firstWeekday = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement("div");
      blank.className = "day-cell";
      blank.style.opacity = "0.35";
      el.calendarGrid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const events = state.schedules.filter((s) => isDateInSchedule(date, s));
      const ymd = fmtDate(date);
      const cell = document.createElement("div");
      const selected = isSameDay(date, state.selectedDate) ? " selected" : "";
      cell.className = "day-cell" + (isSameDay(date, new Date()) ? " today" : "") + selected;
      cell.dataset.date = ymd;
      const dots = events.slice(0, 3).map((e) => {
        const cat = catMeta(e.category);
        return `<span class="event-dot ${cat.cls}">${cat.icon} ${escapeHtml(e.title)}</span>`;
      }).join("");
      cell.innerHTML = `<div class="day-num">${d}</div>${dots}${events.length > 3 ? `<span class="event-dot more">+${events.length - 3}</span>` : ""}`;
      el.calendarGrid.appendChild(cell);
    }
    return renderSelectedDateEvents();
  }

  if (mode === "week") {
    const curr = new Date(cursor);
    const weekday = (curr.getDay() + 6) % 7;
    curr.setDate(curr.getDate() - weekday);
    const start = new Date(curr);
    const end = new Date(curr);
    end.setDate(end.getDate() + 6);
    el.calendarTitle.textContent = `${fmtDate(start)} ~ ${fmtDate(end)}`;

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const ymd = fmtDate(date);
      const events = state.schedules.filter((s) => isDateInSchedule(date, s));
      const selected = isSameDay(date, state.selectedDate) ? " selected" : "";
      const cell = document.createElement("div");
      cell.className = "day-cell" + (isSameDay(date, new Date()) ? " today" : "") + selected;
      cell.dataset.date = ymd;
      cell.innerHTML = `<div class="day-num">${date.getMonth() + 1}/${date.getDate()}</div>` +
        (events.map((e) => {
          const cat = catMeta(e.category);
          return `<span class="event-dot ${cat.cls}">${cat.icon} ${escapeHtml(e.title)}</span>`;
        }).join("") || '<span class="muted">无安排</span>');
      el.calendarGrid.appendChild(cell);
    }
    return renderSelectedDateEvents();
  }

  const day = new Date(cursor);
  state.selectedDate = day;
  el.selectedDateTitle.textContent = formatCnDateWithWeek(day);
  el.calendarTitle.textContent = fmtDate(day);
  const wrap = document.createElement("div");
  wrap.style.gridColumn = "1 / -1";
  wrap.className = "card";
  wrap.dataset.date = fmtDate(day);
  wrap.innerHTML = `<h4>${formatCnDateWithWeek(day)}</h4><div class="muted">下方展示当日日程详情</div>`;
  el.calendarGrid.appendChild(wrap);
  return renderSelectedDateEvents();
}

function renderSelectedDateEvents() {
  const d = new Date(state.selectedDate);
  const list = state.schedules
    .filter((s) => isDateInSchedule(d, s))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));

  if (list.length === 0) {
    el.calendarEventsPanel.innerHTML = `<div class="card"><h4>${formatCnDateWithWeek(d)}</h4><p class="muted">这一天没有安排。</p></div>`;
    return;
  }

  el.calendarEventsPanel.innerHTML = list.map(scheduleCard).join("");
}

function scheduleOptionsHtml(includeEmpty = true, selectedId = "") {
  const head = includeEmpty ? `<option value="">暂不关联</option>` : `<option value="" disabled>请选择日程</option>`;
  return head + state.schedules
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
    .map((s) => {
      const cat = catMeta(s.category);
      return `<option value="${s.id}" ${s.id === selectedId ? "selected" : ""}>[${cat.icon} ${cat.label}] ${escapeHtml(s.title)} (${fmtDateTime(s.startAt)})</option>`;
    })
    .join("");
}

function renderFiles() {
  const cat = el.fileCategoryFilter.value;
  const q = el.fileSearchInput.value.trim().toLowerCase();

  const list = state.attachments
    .filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (!q) return true;
      const linkedSchedules = state.schedules
        .filter((s) => (s.attachmentIds || []).includes(f.id))
        .map((s) => s.title.toLowerCase());
      return f.name.toLowerCase().includes(q) || linkedSchedules.some((v) => v.includes(q));
    })
    .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));

  if (list.length === 0) {
    el.fileList.innerHTML = `<div class="card dog-empty">${dogMiniSvg()}<div><h4>暂无文件</h4><p class="muted">可以上传图片、PDF、文档，并关联到具体日程。</p></div></div>`;
    return;
  }

  el.fileList.innerHTML = list.map((f) => {
    const linked = state.schedules.filter((s) => (s.attachmentIds || []).includes(f.id));
    return `
      <article class="card">
        <h4>${escapeHtml(f.name)}</h4>
        <div class="meta">分类: ${escapeHtml(f.category)} | 大小: ${Math.ceil((f.size || 0) / 1024)}KB | 上传: ${fmtDateTime(f.uploadedAt)}</div>
        <div class="muted">关联日程: ${linked.map((s) => escapeHtml(s.title)).join("、") || "未关联"}</div>
        <div class="two-actions">
          <button class="link-btn" data-action="preview-file" data-id="${f.id}">查看</button>
          <button class="link-btn" data-action="link-file" data-id="${f.id}">关联日程</button>
          <button class="link-btn" data-action="delete-file" data-id="${f.id}">删除</button>
        </div>
      </article>
    `;
  }).join("");

  el.fileScheduleLinkInput.innerHTML = scheduleOptionsHtml();
}

function renderProfile() {
  el.heightInput.value = state.profile.height || "";
  el.weightInput.value = state.profile.weight || "";
  el.shoeInput.value = state.profile.shoe || "";
  el.giftsInput.value = (state.profile.gifts || []).join("\n");
  el.likeCount.textContent = String(state.profile.likes || 0);
}

function render() {
  renderToday();
  renderCalendar();
  renderFiles();
  renderProfile();
  registerReminderTimers();
}

function openScheduleDialog(id = "") {
  el.currentAttachments.innerHTML = "";
  el.scheduleFileInput.value = "";

  if (!id) {
    el.dialogTitle.textContent = "新建日程";
    el.scheduleId.value = "";
    const start = new Date();
    start.setMinutes(start.getMinutes() - (start.getMinutes() % 10));
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    el.titleInput.value = "";
    el.descInput.value = "";
    el.categoryInput.value = "learning";
    el.startInput.value = toInputDateTime(start);
    el.endInput.value = toInputDateTime(end);
    el.reminderInput.value = "none";
  } else {
    const s = state.schedules.find((x) => x.id === id);
    if (!s) return;
    el.dialogTitle.textContent = "编辑日程";
    el.scheduleId.value = s.id;
    el.titleInput.value = s.title;
    el.descInput.value = s.description || "";
    el.categoryInput.value = s.category || "learning";
    el.startInput.value = toInputDateTime(s.startAt);
    el.endInput.value = toInputDateTime(s.endAt);
    el.reminderInput.value = s.reminder || "none";
    const files = state.attachments.filter((a) => (s.attachmentIds || []).includes(a.id));
    el.currentAttachments.innerHTML = files.map((f) => `<span class="chip">${escapeHtml(f.name)}</span>`).join("") || '<span class="chip">暂无附件</span>';
  }

  el.scheduleDialog.showModal();
}

function openLinkDialog(fileId) {
  el.linkFileId.value = fileId;
  el.linkScheduleInput.innerHTML = scheduleOptionsHtml(false);
  el.linkDialog.showModal();
}

function guessCategoryByType(file) {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (type.includes("image") || /\.(png|jpg|jpeg|gif|webp)$/i.test(name)) return "image";
  if (type.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (type.includes("word") || type.includes("text") || /\.(doc|docx|txt|md|ppt|pptx|xls|xlsx)$/i.test(name)) return "doc";
  return "other";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function appendFiles(files, scheduleId = "", forcedCategory = "") {
  const created = [];
  for (const f of files) {
    const dataUrl = await fileToDataUrl(f);
    const attachment = {
      id: uid("att"),
      name: f.name,
      type: f.type || "application/octet-stream",
      category: forcedCategory || guessCategoryByType(f),
      size: f.size,
      uploadedAt: new Date().toISOString(),
      dataUrl
    };
    state.attachments.push(attachment);
    if (scheduleId) {
      const s = state.schedules.find((x) => x.id === scheduleId);
      if (s) {
        s.attachmentIds = s.attachmentIds || [];
        s.attachmentIds.push(attachment.id);
      }
    }
    created.push(attachment);
  }
  return created;
}

function deleteSchedule(id) {
  const s = state.schedules.find((x) => x.id === id);
  if (!s) return;
  if (!confirm("确定删除该日程吗？")) return;

  const attachmentIds = new Set(s.attachmentIds || []);
  state.schedules = state.schedules.filter((x) => x.id !== id);

  for (const aid of attachmentIds) {
    const stillReferenced = state.schedules.some((x) => (x.attachmentIds || []).includes(aid));
    if (!stillReferenced) {
      state.attachments = state.attachments.filter((a) => a.id !== aid);
    }
  }

  save();
  render();
}

function deleteAttachment(id) {
  if (!confirm("确定删除该文件吗？")) return;
  state.attachments = state.attachments.filter((x) => x.id !== id);
  state.schedules.forEach((s) => {
    s.attachmentIds = (s.attachmentIds || []).filter((x) => x !== id);
  });
  save();
  render();
}

function previewAttachment(id) {
  const file = state.attachments.find((x) => x.id === id);
  if (!file) return;
  const win = window.open();
  if (!win) return;

  if (file.type.includes("image")) {
    win.document.write(`<title>${escapeHtml(file.name)}</title><img src="${file.dataUrl}" style="max-width:100%;height:auto"/>`);
    return;
  }

  if (file.type.includes("pdf")) {
    win.document.write(`<title>${escapeHtml(file.name)}</title><embed src="${file.dataUrl}" type="application/pdf" width="100%" height="100%"/>`);
    return;
  }

  win.document.write(`<title>${escapeHtml(file.name)}</title><p>该文件类型无法直接预览，可下载查看。</p><a download="${escapeHtml(file.name)}" href="${file.dataUrl}">下载 ${escapeHtml(file.name)}</a>`);
}

function previewScheduleAttachments(scheduleId) {
  const s = state.schedules.find((x) => x.id === scheduleId);
  if (!s) return;
  const files = state.attachments.filter((f) => (s.attachmentIds || []).includes(f.id));
  if (!files.length) {
    alert("该日程暂无附件");
    return;
  }
  if (files.length === 1) {
    previewAttachment(files[0].id);
    return;
  }
  const list = files.map((f, i) => `${i + 1}. ${f.name}`).join("\n");
  const pick = prompt(`选择要查看的附件序号：\n${list}`);
  if (!pick) return;
  const idx = Number(pick) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= files.length) {
    alert("输入无效");
    return;
  }
  previewAttachment(files[idx].id);
}

function registerReminderTimers() {
  state.reminderTimers.forEach((t) => clearTimeout(t));
  state.reminderTimers = [];

  state.schedules.forEach((s) => {
    const mins = Number(s.reminder || "0");
    if (!mins) return;
    const fireAt = new Date(s.startAt).getTime() - mins * 60 * 1000;
    const delay = fireAt - Date.now();
    if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("可爱的小正正骐提醒", { body: `${s.title} 即将开始` });
      } else {
        alert(`提醒：${s.title} 即将开始`);
      }
    }, delay);
    state.reminderTimers.push(timer);
  });
}

function playPlusOneFx() {
  el.plusOneFx.classList.remove("show");
  void el.plusOneFx.offsetWidth;
  el.plusOneFx.classList.add("show");
}

function spawnLikeParticles() {
  const symbols = ["💗", "⭐", "✨", "💖", "🌟"];
  for (let i = 0; i < 6; i++) {
    const node = document.createElement("span");
    node.className = "fx-particle";
    node.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    node.style.left = `${18 + Math.random() * 36}%`;
    node.style.top = `${42 + Math.random() * 18}%`;
    node.style.setProperty("--dx", `${-30 + Math.random() * 60}px`);
    node.style.setProperty("--dy", `${-50 - Math.random() * 45}px`);
    el.likeFxLayer.appendChild(node);
    setTimeout(() => node.remove(), 900);
  }
}

function initEvents() {
  el.tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    switchView(btn.dataset.view);
  });

  el.quickAddBtn.addEventListener("click", () => openScheduleDialog());
  el.openCreateBtn.addEventListener("click", () => openScheduleDialog());

  el.calendarMode.addEventListener("change", () => {
    state.calendarMode = el.calendarMode.value;
    renderCalendar();
  });

  el.prevRange.addEventListener("click", () => {
    const d = new Date(state.cursorDate);
    if (state.calendarMode === "month") d.setMonth(d.getMonth() - 1);
    if (state.calendarMode === "week") d.setDate(d.getDate() - 7);
    if (state.calendarMode === "day") d.setDate(d.getDate() - 1);
    state.cursorDate = d;
    if (state.calendarMode === "day") state.selectedDate = d;
    renderCalendar();
  });

  el.nextRange.addEventListener("click", () => {
    const d = new Date(state.cursorDate);
    if (state.calendarMode === "month") d.setMonth(d.getMonth() + 1);
    if (state.calendarMode === "week") d.setDate(d.getDate() + 7);
    if (state.calendarMode === "day") d.setDate(d.getDate() + 1);
    state.cursorDate = d;
    if (state.calendarMode === "day") state.selectedDate = d;
    renderCalendar();
  });

  el.calendarGrid.addEventListener("click", (e) => {
    const node = e.target.closest("[data-date]");
    if (!node) return;
    state.selectedDate = parseYmd(node.dataset.date);
    renderCalendar();
  });

  el.scheduleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = el.scheduleId.value;
    const title = el.titleInput.value.trim();
    const description = el.descInput.value.trim();
    const category = el.categoryInput.value;
    const startAt = new Date(el.startInput.value);
    const endAt = new Date(el.endInput.value);
    if (!title) return alert("请输入标题");
    if (!category) return alert("请选择分类");
    if (Number.isNaN(+startAt) || Number.isNaN(+endAt)) return alert("请选择有效时间");
    if (+endAt < +startAt) return alert("结束时间不能早于开始时间");

    const files = [...el.scheduleFileInput.files];

    if (!id) {
      const schedule = {
        id: uid("sch"),
        title,
        description,
        category,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        reminder: el.reminderInput.value,
        attachmentIds: []
      };
      state.schedules.push(schedule);
      if (files.length) await appendFiles(files, schedule.id);
    } else {
      const s = state.schedules.find((x) => x.id === id);
      if (!s) return;
      s.title = title;
      s.description = description;
      s.category = category;
      s.startAt = startAt.toISOString();
      s.endAt = endAt.toISOString();
      s.reminder = el.reminderInput.value;
      if (files.length) await appendFiles(files, s.id);
    }

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    state.schedules.sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
    save();
    el.scheduleDialog.close();
    render();
  });

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "edit-schedule") openScheduleDialog(id);
    if (action === "delete-schedule") deleteSchedule(id);
    if (action === "view-attachments") previewScheduleAttachments(id);
    if (action === "preview-file") previewAttachment(id);
    if (action === "link-file") openLinkDialog(id);
    if (action === "delete-file") deleteAttachment(id);
  });

  el.uploadFileBtn.addEventListener("click", () => {
    el.fileUploadInput.value = "";
    el.fileCategoryInput.value = "image";
    el.fileScheduleLinkInput.innerHTML = scheduleOptionsHtml(true);
    el.fileDialog.showModal();
  });

  el.fileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = el.fileUploadInput.files[0];
    if (!f) return alert("请选择文件");
    const scheduleId = el.fileScheduleLinkInput.value;
    await appendFiles([f], scheduleId, el.fileCategoryInput.value);
    save();
    el.fileDialog.close();
    render();
  });

  el.linkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fileId = el.linkFileId.value;
    const scheduleId = el.linkScheduleInput.value;
    if (!fileId || !scheduleId) return;
    const schedule = state.schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;
    schedule.attachmentIds = schedule.attachmentIds || [];
    if (!schedule.attachmentIds.includes(fileId)) schedule.attachmentIds.push(fileId);
    save();
    el.linkDialog.close();
    render();
  });

  el.saveProfileBtn.addEventListener("click", () => {
    state.profile.height = el.heightInput.value.trim();
    state.profile.weight = el.weightInput.value.trim();
    state.profile.shoe = el.shoeInput.value.trim();
    state.profile.gifts = el.giftsInput.value.split("\n").map((v) => v.trim()).filter(Boolean);
    save();
    alert("孩子信息已保存");
  });

  el.likeBtn.addEventListener("click", () => {
    state.profile.likes = Number(state.profile.likes || 0) + 1;
    save();
    renderProfile();
    playPlusOneFx();
    spawnLikeParticles();
  });

  el.redeemBtn.addEventListener("click", () => {
    const cost = Number(el.redeemCostInput.value || 0);
    if (!Number.isInteger(cost) || cost <= 0) return alert("请输入有效兑换点赞数");
    if (state.profile.likes < cost) return alert("点赞不足，继续加油");

    state.profile.likes -= cost;
    const firstGift = state.profile.gifts[0];
    save();
    renderProfile();
    alert(firstGift ? `兑换成功，扣减 ${cost} 点赞。可考虑兑换礼物：${firstGift}` : `兑换成功，扣减 ${cost} 点赞。`);
  });

  el.fileCategoryFilter.addEventListener("change", renderFiles);
  el.fileSearchInput.addEventListener("input", renderFiles);
}

function start() {
  load();
  initEvents();
  el.calendarMode.value = state.calendarMode;
  state.selectedDate = new Date();
  switchView("today");
}

start();
