# 可爱的小正正骐（可运行原型）

更生动的儿童日程管理应用，包含可爱装饰、分类视觉、旅行动态展示、互动点赞动画，并支持可选云同步。

## 运行方式
1. 双击 `index.html`
2. 或执行 `python -m http.server 5173` 后访问 `http://127.0.0.1:5173`

## 主要增强
- 视觉升级：渐变蓝背景、线条小狗、云朵/星星装饰、圆角卡片、柔和阴影、hover动效。
- 日历升级：月/周/日切换，顶部显示 `YYYY年M月D日 · 星期X`，不在每个日格重复显示星期。
- 分类系统：学习📘/体育⚽/旅游✈️/艺术🎨/社交🎉，在日历、今日活动、详情中颜色+图标统一展示。
- 首页动态：当天存在旅游日程时自动显示 `🎉 HAPPY TRAVEL 🎉` 动效横幅。
- 互动强化：点赞 `+1` 飘字 + 爱心/星星粒子动画，支持兑换礼物扣减点赞。

## 跨设备同步（Supabase）
如果 `supabase-config.js` 未配置，应用会使用本机浏览器保存（localStorage）。

### 1) 创建表（Supabase SQL Editor 执行）
```sql
create table if not exists public.kid_planner_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.kid_planner_state enable row level security;

create policy "allow anon read" on public.kid_planner_state
for select to anon using (true);

create policy "allow anon write" on public.kid_planner_state
for insert to anon with check (true);

create policy "allow anon update" on public.kid_planner_state
for update to anon using (true) with check (true);
```

### 2) 填写配置
编辑 `supabase-config.js`：
```js
window.SUPABASE_CONFIG = {
  SUPABASE_URL: "你的 Supabase URL",
  SUPABASE_ANON_KEY: "你的 anon key"
};
```

### 3) 使用
- 打开“我的”页面，查看“云同步状态”。
- 状态显示已连接后，手机和电脑使用同一个站点地址即可共享数据。

## 说明
- 附件目前以 DataURL 存在状态里，文件很大时可能触发浏览器存储上限。
- 提醒功能基于浏览器通知权限。
