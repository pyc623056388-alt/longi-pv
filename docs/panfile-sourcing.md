# 内置 PAN / Datasheet / EPW 数据来源

## 隆基（`数据库/longi/`）

- 来源：你整理的 `数据库/longi/Longi General/` 下 LR7 系列 PAN
- **产品目录**（[`scripts/longi-product-catalog.json`](../scripts/longi-product-catalog.json)）：固定 **14 款** X10 定品，型号统一为 `LR{7|8}-{片数}{型号线}-{功率}M`。
- **筛选规则**（[`scripts/module-curation.json`](../scripts/module-curation.json)）：
  - 48 片 → **475Wp**
  - 54 片 → **475Wp**
  - 60 片 → **540Wp**
  - 66 片 → **650Wp**
  - 72 片 → **650Wp**
- **族模板**：HVD / HVH / HVHL 族内共用代表 PAN 电气参数；缺失型号在 `build:seed` 中合成（`source: pan_synthesized`）。代表 PAN 文件名统一为 `LONGi_{Model}.PAN`。
- 入库字段含 STC 电参数：`Voc` / `Isc` / `Vmp` / `Imp`（来自 PAN）

## 竞品（Datasheet + 校对）

- 来源：`数据库/竞品/Residential/*.pdf`、`数据库/竞品/Utility/*.pdf`（**不再**入库 Utility 目录下 630–720 的 `.PAN`）
- 配置：[`scripts/datasheet-sources.json`](../scripts/datasheet-sources.json)
- 流程：

```powershell
npm run extract:datasheet   # PDF → data/builtin/datasheet-extract-review.json
# 校对 review JSON 或将修正写入 data/builtin/datasheet-overrides.json
npm run build:seed          # 仅合并 status=approved 的条目
```

- 功率档位：户用 **475Wp**；60 片 **510/515Wp**；大版型 **630Wp**（Datasheet 最近档，见 overrides 说明）
- 无文本层 PDF（如部分 JA）可在 [`data/builtin/datasheet-overrides.json`](../data/builtin/datasheet-overrides.json) 手工补全

## 气象（`data/builtin/weather/epw/`）

- 应用内**不显示**原始 `.epw` 文件，只显示解析后的气象站
- 站点列表：[`scripts/epw-stations-au-nz.json`](../scripts/epw-stations-au-nz.json)
- 来源：[climate.onebuilding.org](https://climate.onebuilding.org/WMO_Region_5_Southwest_Pacific/) TMYx 2011–2025

```bash
npm run fetch:epw
npm run build:seed
```

### 浏览器里仍只有旧组件库 / 旧气象？

1. 气象：数据库 → **同步内置气象库**
2. 或清除 `longi-pv:modules:longi`、`longi-pv:modules:competitor`、`longi-pv:seeded-v5` 后刷新

内置种子版本为 **`longi-pv:seeded-v5`**（**14** 款隆基、10 款竞品、约 40 个澳新气象站）。升级到 v5 时会用新 seed **整体替换** 隆基组件库（保留你单独编辑过的价格需重新在数据库中设置）。

## 生成内置库

```bash
npm run extract:datasheet
npm run fetch:epw
npm run build:seed
```

对比页规格表仍只展示功率 / 尺寸 / 温度系数 / 衰减 / 单价；**STC 电参数**仅在数据库 → 编辑组件中展示。
