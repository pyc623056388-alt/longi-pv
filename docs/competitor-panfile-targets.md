# 澳洲 2025–2026 竞品 PAN 目标清单

官网通常**不提供**公开 `.pan` 批量下载，需从 PVsyst 用户库、厂商澳洲技术支持或渠道工程包获取。

## 已入库（`au-2025/`）

| 厂商 | 型号 | 功率 | 备注 |
|------|------|------|------|
| Jinko | JKM630N-66HL4M-BDV | 630W | Tiger Neo |
| Jinko | JKM640N-66HL4M-BDV | 640W | |
| Jinko | JKM650N-66HL4M-BDV | 650W | |
| Jinko | JKM720N-66HL5-BDV | 720W | |
| Trina | TSM-740NEG21C.20 | 740W | 建议用 2024+ Vertex N PAN 替换 |

## 建议补齐（放入 `data/builtin/pan/competitor/sourced/`）

| 厂商 | 建议型号 | 功率档 | 场景 |
|------|----------|--------|------|
| Trina | TSM-700NEG21C.* / TSM-670NEG21C.* | 670–700W | Vertex N 地面电站 |
| Trina | TSM-655NEG21C.* | ~655W | Vertex N |
| Trina | TSM-440NEG9R.25 等 | ~440W | Vertex S+ 工商业（`sourced/` 最低 430Wp） |
| JA Solar | JAM72D42-630LB / JAM72D42-640LB | 630–640W | DeepBlue 4.0 |
| JA Solar | JAM66D45-600LB | ~600W | 中型项目 |
| Tongwei | TW640H-HDT / TW650H / TW675H | 640–675W | 2024+ HDT/TNC |
| Jinko | JKM670N-* / JKM710N-* | 670–710W | 可选补全 |

## 获取渠道（按优先级）

1. **PVsyst**：`ComposPV\PVmodules` 导出对应型号 `.pan`
2. **天合澳洲**：[Trina AU Download](https://www.trinasolar.com/au/download/) → 技术支持索要 PAN
3. **JA / 通威**：澳洲销售或项目邮箱索取工程包
4. **经销商**：Synapsun 等平台偶见附带 `.pan`（需确认授权）

## 入库规则

- PVsyst `Version` ≥ 7.2
- `au-2025/`：功率 ≥ 580Wp
- `sourced/`：功率 ≥ 430Wp（含 Vertex S+）
- 执行：`npm run build:seed`

详见 [data/builtin/pan/competitor/sourced/README.md](../data/builtin/pan/competitor/sourced/README.md)。
