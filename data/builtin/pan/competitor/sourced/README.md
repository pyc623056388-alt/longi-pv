# 竞品 PAN 上传目录

将天合、JA、通威等 **.pan** 文件放在本目录（可使用子文件夹）。

## 步骤

1. 按 [docs/competitor-panfile-targets.md](../../../../docs/competitor-panfile-targets.md) 收集约 10 个目标型号
2. 复制 `.pan` 到本目录
3. 在项目根目录执行：

```powershell
npm run build:seed
```

4. 刷新应用；数据库 → **竞品** 库应增加对应条目

## 筛选说明

- 本目录最低功率 **430Wp**（可收录 Vertex S+ 等工商业型号）
- `au-2025/` 目录仍为 **580Wp** 及以上
- 同型号仅保留**最新修改时间**的文件

## 仍只见 5 条竞品？

浏览器 `localStorage` 可能缓存旧库。可清除键 `longi-pv:modules:competitor` 后刷新，或重新打开无痕窗口。
