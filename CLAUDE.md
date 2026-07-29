# InterviewTrainer 项目说明（供 Claude 参考）

## 技术栈
- React 19 + TypeScript + Vite 8 + Tailwind CSS 4
- 路由：react-router-dom v7（`src/App.tsx` 中的 `BrowserRouter`）
- 数据：`public/` 下的 JSON 文件运行时 `fetch`；用户进度存 `localStorage`
- 无组件库、无深色模式；视觉风格为浅色（`bg-gray-50` 底、白卡片、indigo 强调、`rounded-xl`）

## 目录约定
- 页面：`src/pages/`
- 组件：`src/components/`
- 工具/逻辑：`src/utils/`
- 类型：`src/types/`

---

# 2027秋招模块维护规范

## 模块概览
- 唯一数据源：`public/recruitment-companies.json`（结构为 `{ "batch", "companies": [...] }`）
- 页面：`src/pages/RecruitmentPage.tsx`，路由 `/recruitment`，首页导航「2027秋招」进入
- 类型：`src/types/recruitment.ts`；逻辑：`src/utils/recruitment.ts`
- 组件：`src/components/recruitment/`

## 数据维护规则

1. 所有秋招数据变更都必须更新唯一数据源 `public/recruitment-companies.json`。
2. 收到自然语言指令时，识别其中的：企业、岗位、部门、状态、日期、面试阶段、简历版本、下一步行动、结果、备注。
3. 日期统一保存为 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm`。
4. 每次修改企业记录时，同步更新该记录的 `lastUpdated`（使用当前真实日期）。
5. 不确定的信息留空，不得自行编造（招聘日期、截止日期、链接、面试安排、投递结果等）。
6. 不要删除已经结束的企业记录。
7. 被拒、主动放弃或流程结束时：将 `status` 设为「结束」，并在 `result` 中记录具体结果。
8. 新增企业时必须生成唯一且稳定的 `id`（英文/拼音小写短横线，如 `china-merchants-bank`）。
9. 修改后检查 JSON 格式是否合法。
10. 不要因为修改秋招数据而更改 InterviewTrainer 的其他业务模块。
11. 用户要求总结时，直接读取当前数据生成总结，不要仅依据聊天记忆。
12. 用户提到「今天」时，使用当前真实日期。
13. 用户未明确要求修改数据时，不要擅自改变记录。

## 固定状态（不得新增含义重复的状态）
`待关注` → `已开放` → `已投递` → `笔试/测评` → `面试` → `Offer` → `结束`

「准备投递 / 等待投递 / 已申请 / 面试中 / 已拒绝」等情况一律通过 `status` + `nextAction` / `notes` / `result` 表达。

## 企业字段
`id, company, category, priority, status, targetRoles[], department, location[], batch, openDate, deadline, applicationDate, officialUrl, referral, resumeVersion, nextAction, nextActionDate, interviewStage, interviewDate, result, notes, lastUpdated`

- `category`：`互联网大厂` / `行业龙头` / `央国企`
- `priority`：`P0` / `P1` / `P2`
- `referral`：`未寻找` / `寻找中` / `已内推` / `不需要`

## 自然语言指令示例

- 「把华为改成已投递，岗位是AI工程师，今天投递，使用resume-ai-v2。」
  → 更新 `status=已投递`、`targetRoles`（含 AI工程师）、`applicationDate=今天`、`resumeVersion=resume-ai-v2`、`lastUpdated`。
- 「腾讯进入一面，面试时间是8月12日下午。」
  → 更新 `status=面试`、`interviewStage=一面`、`interviewDate=<当年>-08-12 14:00`（下午可记 14:00，或仅记日期）、`lastUpdated`。
- 「拼多多流程结束，笔试未通过。」
  → 更新 `status=结束`、`result=笔试未通过`、`lastUpdated`。
- 「新增招商银行，目标岗位是数据科学和金融科技，优先级P1。」
  → 在 `companies` 中新增一条记录，生成唯一 `id`，`batch=2027秋招`、`status=待关注`、其余不确定字段留空。
- 「总结未来七天我需要完成的秋招任务。」
  → 读取全部记录，依据 `nextActionDate` / `deadline` / `interviewDate` 生成按日期排序的任务清单，**不修改数据**。

## 与面试训练的联动
- 企业 `status` 为「面试」时，详情弹窗显示「开始面试准备」按钮。
- 点击跳转到现有每日学习训练页 `/daily`，并携带 `company` / `role` / `stage` 查询参数（训练页顶部展示上下文横幅，不改变练习逻辑）。
- 第一版不自动创建训练记录。
