# 隆基智能光伏 · 全生命周期增益测算（v3）

Next.js 页面，本地在 Cursor 修改，通过 **GitHub + Vercel** 自动部署（推荐方式）。

---

## 一、一次性准备（约 15 分钟）

### 1. 安装 Node.js 与 Git（本机若已用 winget 安装可跳过）

已通过 winget 安装时可跳过下载，**请务必完全退出并重新打开 Cursor**，再在终端验证：

1. 打开 https://nodejs.org/ ，下载 **LTS** 并安装。
2. 关闭并重新打开终端 / Cursor。
3. 验证：

```powershell
node -v
npm -v
```

### 2. 安装 Git

1. 打开 https://git-scm.com/download/win 安装 **Git for Windows**。
2. 重新打开终端后验证：

```powershell
git --version
```

### 3. 注册账号（若还没有）

- GitHub：https://github.com/signup  
- Vercel：https://vercel.com/signup（建议用 **GitHub 登录**，后面导入仓库更方便）

---

## 二、本地运行与改代码

在项目目录打开终端（路径含空格请加引号）：

```powershell
cd "$env:USERPROFILE\Documents\long-i-pv"
```

> **推荐工作目录**：`C:\Users\dennispan\Documents\long-i-pv`（已从 Google Drive 复制到本地，开发更快）。Drive 上的副本可保留作备份。

安装依赖（任选一种）：

```powershell
# 方式 A：npm（Node 自带）
npm install

# 方式 B：pnpm（与 lock 文件一致，需先执行 npm install -g pnpm）
pnpm install
```

开发预览：

```powershell
npm run dev
# 或 pnpm dev
```

浏览器打开 http://localhost:3000 。改 `app/page.tsx` 等文件会自动刷新。

上线前本地构建检查：

```powershell
npm run build
```

无报错再继续部署。

---

## 三、推到 GitHub（首次）

### 1. 在 GitHub 新建仓库

- 登录 GitHub → **New repository**
- 名称例如：`longi-pv`
- 选 **Private** 或 Public
- **不要**勾选 “Add a README”（本地已有代码）
- 创建后记下仓库地址，例如：  
  `https://github.com/你的用户名/longi-pv.git`

### 2. 本地初始化并推送

```powershell
cd "g:\My Drive\Longi\AI Tool\long-i-pv"

git init
git add .
git commit -m "LONGi PV v3 初始版本"
git branch -M main
git remote add origin https://github.com/你的用户名/longi-pv.git
git push -u origin main
```

首次 push 可能弹出 GitHub 登录窗口，按提示完成授权。

---

## 四、在 v0 上部署（你当前选择的方式）

v0 与 Vercel 共用同一套 Next.js 构建；**在 Cursor 里改好的代码需要先进入 Git**，再在 v0 里关联或同步。

### 推荐流程

1. **本地验证**（见第二节 `npm run build`）
2. **推送到 GitHub**（见第三节）
3. 打开 [v0.dev](https://v0.dev) → 你的项目 → **Settings / Git**（或 **Connect to GitHub**）
4. 选择仓库 `long-i-pv`，分支 `main`
5. 在 v0 中点击 **Deploy**（底层由 Vercel 构建，与 Dashboard 部署等价）

### 与「只在 v0 画布改代码」的区别

| 方式 | 适合场景 |
|------|----------|
| **Cursor 改代码 → Git push → v0/Vercel 自动部署** | 正式迭代、版本可追溯（推荐） |
| **仅在 v0 聊天里改 UI** | 快速试布局；需再 Sync 到 Git 才能和本地一致 |

### 本次 Cursor 已做的部署向优化

- `lib/pv-calculation.ts`：测算逻辑独立，便于维护
- `app/page.tsx`：表单参数驱动结果区，非写死演示数字
- `app/layout.tsx`：Geist 字体变量正确挂载
- `next.config.mjs`：移除 `ignoreBuildErrors`，构建失败会在本地/Vercel 提前暴露

---

## 五、在 Vercel 首次部署（不经过 v0 控制台亦可）

1. 打开 https://vercel.com/dashboard  
2. **Add New…** → **Project**  
3. 选择刚推送的 `longi-pv` 仓库 → **Import**  
4. 保持默认即可（Framework: **Next.js**）  
   - 若检测到 `pnpm-lock.yaml`，Install Command 一般为 `pnpm install`  
5. 点击 **Deploy**，等待 1～3 分钟  
6. 完成后得到线上地址，例如：`https://longi-pv-xxx.vercel.app`

**不需要**在 v0.dev 里点 Deploy。

---

## 六、以后每次更新（日常流程）

1. 在 Cursor 修改代码  
2. 本地 `npm run dev` / `npm run build` 确认无误  
3. 提交并推送：

```powershell
git add .
git commit -m "描述本次修改"
git push
```

4. Vercel 会自动重新构建；在 Dashboard → **Deployments** 查看进度。

---

## 七、主要文件说明

| 文件 | 用途 |
|------|------|
| `app/page.tsx` | 四屏滚动页面、测算与图表（v3 主体） |
| `app/sign-in/`、`app/sign-up/` | Clerk 邮箱登录 / 注册页 |
| `app/login/page.tsx` | 旧邀请码路径，重定向到 `/sign-in` |
| `proxy.ts` | Next.js 16 全站门禁（Clerk `clerkMiddleware`） |
| `lib/pv-calculation.ts` | 装机容量 / 发电量 / 成本 / 回本测算 |
| `app/layout.tsx` | 标题、SEO、ClerkProvider、Vercel Analytics |
| `app/globals.css` | 全局样式 |
| `public/` | 图标与静态资源 |
| `数据库/` | 隆基 PAN、竞品 PDF 源文件（构建用） |
| `data/builtin/datasheet-extract-review.json` | 竞品 PDF 抽取 + 校对结果 |
| `data/builtin/weather/epw/` | 澳新城市 EPW 源文件 |
| `lib/seed-data.json` | 由 `npm run build:seed` 生成的默认组件库与气象 |

### 更新内置 PAN / 气象

```powershell
# 1. 更新 数据库/longi 或 数据库/竞品 下文件
# 2. 竞品 PDF：抽取并校对
npm run extract:datasheet
# 3. 下载/更新澳新 EPW
npm run fetch:epw
# 4. 生成 lib/seed-data.json
npm run build:seed
```

内置气象库约 **40** 个澳新主流城市（友好中文名，如「悉尼 Sydney」）。若页面仍只见少量旧站点：数据库 → **同步内置气象库**，或清除浏览器本站数据后刷新。

详见 [docs/panfile-sourcing.md](docs/panfile-sourcing.md)。

---

## 八、邮箱账号访问控制（Clerk）

邀请码门禁已替换为 **Clerk 邮箱登录**。建议对经销商使用 **邀请制（Restricted）**，避免任何人公开注册。

### 1. 创建 Clerk 应用

1. 打开 https://dashboard.clerk.com → Create application  
2. 启用 **Email** + **Password**（建议开启邮箱验证）  
3. API Keys 页复制 Publishable Key / Secret Key  

### 2. 开启邀请制（重要）

你截图里的 **Email** 页不要关「Sign-up with email」——邀请用户仍需要邮箱注册能力。

正确设置：

1. 左侧 **Configure** → 找 **Restrictions**（访问控制 / 限制）  
2. **Sign-up mode** 选 **Restricted**（受限 / 邀请制）并保存  
3. （建议）**SSO connections** 里关掉 **Google**  
4. 顶部 **Users** → **Invite**，输入经销商邮箱发送邀请  
5. 对方点邮件链接完成注册后即可登录  

Restricted 开启后：未受邀用户不能自行注册；已有用户可在 Users 里 Ban。

### 3. 本地开发

```powershell
copy .env.example .env.local
```

编辑 `.env.local`，填入：

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- 路径变量保持与 `.env.example` 一致（`/sign-in`、`/sign-up`）

重启 `pnpm dev` 后，访问 http://localhost:3000 会进入 `/sign-in`。

### 4. Vercel 生产 / Preview

1. Vercel Dashboard → 项目 → **Settings** → **Environment Variables**  
2. 添加 Clerk 变量（Production + Preview；Value 勿含前后空格）  
3. **删除**旧的 `ACCESS_CODES`、`AUTH_SECRET`（若仍存在）  
4. **Redeploy** 一次使变量生效  

### 5. 发给经销商（示例）

> Access URL: `https://你的域名.vercel.app`  
> 请查收管理员发送的 Clerk 邀请邮件，点击链接完成注册后登录。  
> 未收到邀请请联系管理员。

### 6. 日常账号管理

- 登录 [Clerk Dashboard → Users](https://dashboard.clerk.com)  
- Invite 新经销商；Ban / 删除离职人员  
- 可按需再开 Allowlist（仅允许特定邮箱域名）  

---

## 九、常见问题

**Q：为什么推荐 GitHub + Vercel，而不是只在 v0 部署？**  
A：你在 Cursor 改的是本地仓库；连 Git 后每次 `git push` 自动上线，版本可追溯，和 v0 草稿无关。

**Q：没有装 pnpm 可以吗？**  
A：可以。本地用 `npm install` / `npm run dev` 即可；Vercel 仍可根据 `pnpm-lock.yaml` 用 pnpm 构建。

**Q：构建失败？**  
A：先在本地执行 `npm run build` 看报错；Vercel 项目 → **Deployments** → 点失败记录查看 **Build Logs**。

**Q：想用公司域名？**  
A：Vercel 项目 → **Settings** → **Domains** 添加域名并按提示配置 DNS。

**Q：刷新页面后对比参数没了？**  
A：对比页表单与「已手动调整」会自动写入浏览器 `localStorage`（键 `longi-pv:session-v1`）。组件库在 `longi-pv:modules:*` / `longi-pv:weather`；内置库版本为 `longi-pv:seeded-v5`（**14** 款隆基、**10** 款竞品、约 40 个气象站）。STC 电参数（Voc/Isc/Vmp/Imp）在 **数据库 → 编辑组件** 中查看，对比页表格不展示。若库未更新，清除 `longi-pv:seeded-v5` 与 `longi-pv:modules:*` 后刷新，或重新执行 `npm run build:seed`。

---

## 九、备选：不用 Git，仅 CLI 部署（临时方案）

已安装 Node 后，在项目目录：

```powershell
npx vercel
npx vercel --prod
```

适合快速试部署；长期仍建议用第三节的 GitHub 方式。

---

## 十、项目案例页（`/cases`）

顶栏「项目案例」进入列表与详情（Layout A 封面网格）。框架已就绪：

- 案例元数据：`lib/case-catalog.ts`（标题、地点、正文、关联版型 `seriesIds`）
- 媒体：优先填 Google Drive `fileId`；未填时可用 `localSrc` / `coverLocalSrc` 占位
- 照片/视频点击仅站内预览；「查看版型」跳转 `/recommend?series=系列ID`

**后续锁定网盘时**：在 Drive 为每个案例建文件夹并上传素材 → 把文件共享为「知道链接的人可查看」→ 将 `fileId` 写入对应案例的 `coverFileId` / `media[].fileId` → 部署即可。若只需替换素材内容，可在 Drive 对同一文件「上传新版本」保留原 `fileId`，无需改代码。

---

## 十一、Legal / 知识产权

本仓库及配套测算工具为**隆基绿能内部专用**：

- **严禁外发**：不得向客户、第三方或公开渠道传播（含截图、转发、上传公网或对外部署）。
- **仅供参考**：测算与导出报告结果不构成投资建议、正式工程承诺或合同依据。
- **知识产权**：工具界面、算法、报告版式及数据组织等归隆基绿能所有；未经授权不得复制、修改或传播。
- **署名**：软件开发 **Dennis Pan**；技术支持 **TaoTao Cai**。
- **反馈**：dennispan@longi.com

应用内页脚与 PDF 报告页脚/水印会同步展示上述声明。正式对外材料须经公司法务审核。
