import type { AntiShadingScenario, GainRuleId } from "@/lib/pv-types";
import type { ModuleSpecFieldKey, ResultMetricId } from "../types";

const resultMetrics: Record<ResultMetricId, string> = {
  moduleCount: "组件块数",
  capacity: "实际装机容量 (kW)",
  firstYearYield: "首年发电量 (MWh)",
  lifetimeYield: "全寿命发电量 (MWh)",
  firstYearRevenue: "首年售电收入",
  lifetimeRevenue: "总发电收益 (全寿命)",
  moduleCost: "组件总成本",
  accessoryCost: "除组件外其他费用",
  projectCost: "项目总成本",
  netProfit: "净收益",
  staticPayback: "首年静态回收期 (年)",
  dynamicPayback: "全站投资回收期 (年)",
};

const specParams: Record<ModuleSpecFieldKey, string> = {
  power: "组件功率",
  dimensions: "尺寸",
  tempCoef: "温度系数",
  firstYearDeg: "首年衰减",
  annualDeg: "年衰减率",
  price: "单瓦价格",
};

export const zhMessages = {
  locale: "zh" as const,
  numberLocale: "zh-CN",
  htmlLang: "zh-CN",

  common: {
    database: "数据库",
    longi: "隆基",
    competitor: "竞品",
    longiModule: "隆基组件",
    competitorModule: "竞品组件",
    defaultValue: "默认值",
    notSet: "未设置",
    vs: "vs",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    add: "新增",
    search: "搜索",
    confirmDelete: "确定删除？",
    confirmDeleteModule: "确定删除该组件？",
    unnamedProject: "未命名项目",
    yearUnit: "年",
    panelUnit: "片",
    modules: "块",
    perModuleUnit: "块",
    pricePerPanelApprox: (sym: string, amount: string) =>
      `≈ ${sym}${amount}/块`,
    prevPage: "上一页",
    nextPage: "下一页",
    pendingCompletion: "待补全",
    actions: "操作",
  },

  nav: {
    aria: "工具切换",
    compare: "增益对比",
    compareHint: "隆基 vs 竞品全生命周期测算",
    recommend: "产品选型",
    recommendHint: "按场景与需求推荐版型",
  },

  recommend: {
    eyebrow: "产品选型站",
    title: "找到适合客户的隆基版型",
    subtitle:
      "根据应用场景、发电类型与功能需求，从 Hi-MO X10 产品矩阵自动推荐组件，并给出关键规格数据。与增益对比工具并行使用：这里负责选型，那边负责测算。",
    scrollHint: "向下滚动开始选型",
    formHint: "选择条件时会自动限制无货组合",
    formTitle: "筛选条件",
    stepBadge: "第一步",
    stepTitle: "选择客户需求",
    stepSubtitle: "配置应用场景与功能条件，系统将推荐匹配的隆基版型",
    matchCount: (n: number) => `预计匹配：${n} 个系列`,
    matchNone: "当前组合无匹配系列",
    optionDisabled: "与已选条件冲突，暂无对应组件",
    apply: "应用并查看推荐",
    backToFilters: "返回修改条件",
    weakAlternatives: "弱替代方案",
    weakAlternativesHint: "点击可切换查看该系列",
    photoFront: "正面",
    photoRear: "背面",
    photoSide: "侧面",
    photoBevel: "斜视",
    photoOther: "产品图",
    sections: {
      scenario: "应用场景",
      roofLoad: "屋顶承重",
      generation: "发电类型",
      power: "功率档位",
      needs: "功能需求",
    },
    scenario: {
      residential: "户用分布式",
      commercial: "工商业屋顶",
      flexible: "不限 / 灵活",
    },
    scenarioDesc: {
      residential: "户用屋顶与小型分布式项目",
      commercial: "工商业屋顶与较大装机",
      flexible: "不限定场景，扩大可选范围",
    },
    roofLoad: {
      normal: "常规承重",
      limited: "承重受限（轻质）",
    },
    roofLoadDesc: {
      normal: "常规屋顶载荷，可选标准版型",
      limited: "仅匹配轻质 HVHL 等低载荷方案",
    },
    generation: {
      any: "不限",
      monofacial: "单面",
      bifacial: "双面",
      transparent: "透明双面",
    },
    power: {
      auto: "按场景自动",
      residential: "户用约 475W",
      medium: "中版型约 540W",
      large: "大版型约 650W",
    },
    needs: {
      antiHotspot: {
        label: "抗热斑 / 防起火",
        hint: "降低局部过热风险",
      },
      antiDust: {
        label: "防积灰",
        hint: "优先匹配 HVHF 等防积灰边框",
      },
      antiGlare: {
        label: "防眩光",
        hint: "机场、道路等眩光敏感场景",
      },
      antiShading: {
        label: "抗阴影遮挡",
        hint: "局部遮挡下减少功率损失",
      },
      lightweight: {
        label: "轻质版型",
        hint: "HVHL，适合低载荷屋顶",
      },
      saltMist: {
        label: "盐雾 / 沿海",
        hint: "盐雾认证环境",
      },
      ammonia: {
        label: "氨气 / 农牧",
        hint: "畜牧、农场等氨气环境",
      },
      hail: {
        label: "冰雹工况",
        hint: "冰雹认证相关场景",
      },
    },
    result: {
      badge: "推荐结果",
      title: "建议组件与关键数据",
      empty: "当前条件暂无合适系列，请放宽筛选后重试",
      efficiency: "最高效率",
      weight: "重量",
      tempCoef: "温度系数",
      degradation: "首年 / 年衰减",
      warranty: "产品 / 功率质保",
      glass: "玻璃",
      dualGlass: "双玻",
      singleGlass: "单玻",
      openCompare: "用此型号去做增益对比",
      alternative: "备选系列",
      pickSeries: "产品型号",
      pickSeriesSearch: "搜索型号或系列…",
      pickSeriesEmpty: "未找到匹配型号",
      powerBand: "功率档",
      powerBandDefault: "475/480",
      powerBandMedium: "540",
      powerBandLarge: "650",
      powerBandUnavailable: "该型号不支持此功率档",
      manualBrowse: "手动浏览",
      recommendedMatch: "条件匹配",
    },
    resources: {
      title: "产品资料（Google Drive）",
      subtitle: "点击即可打开对应 Datasheet、质保、安装手册与证书，文件不占用站点体积",
      coreDocs: "核心文档",
      datasheet: "Datasheet",
      warranty: "质保文件",
      installationManual: "安装手册",
      photos: "产品照片",
      certificates: "认证证书",
      photosEmpty: "该系列暂无已挂载照片",
      certsEmpty: "该系列暂无已挂载证书",
      unavailable: "暂未关联 Drive 资料",
    },
  },

  hero: {
    titleLine1: "隆基智能光伏",
    titleLine2: "全生命周期增益测算",
    subtitle: "基于实际项目参数与气象数据的 ROI 评估",
    scrollHint: "向下滚动开始测算",
    advantages: {
      temperature: {
        title: "温度系数",
        description: "高温工况下功率输出更稳定，衰减更可控",
        alt: "温度系数优势示意：高温工况下功率输出更稳定",
      },
      antiShading: {
        title: "强大的抗阴影遮挡能力",
        description: "局部遮挡场景下仍能保持较高发电效率",
        alt: "抗阴影遮挡优势示意：局部遮挡下仍保持较高发电效率",
      },
      lowLight: {
        title: "弱光发电能力",
        description: "清晨、傍晚及多云条件下发电表现更优",
        alt: "弱光发电优势示意：低辐照条件下仍保持较高发电表现",
      },
    },
  },

  setup: {
    stepBadge: "第一步",
    title: "项目初始化",
    subtitle: "配置您的项目信息与测算模式",
    projectName: "项目名称",
    projectNamePlaceholder: "输入项目名称...",
    weather: "气象站选择",
    weatherPlaceholder: "选择气象站...",
    weatherSearch: "搜索气象站或地点…",
    comparisonModeTitle: "选择对比模式",
    modes: {
      sameCount: {
        title: "同片数对比",
        desc: "以相同组件数量对比发电效率",
      },
      fixedCapacity: {
        title: "固定装机量对比",
        desc: "以相同装机容量对比系统成本",
      },
    },
    moduleCountLabel: "组件数量",
    capacityLabel: "装机容量 (kW)",
  },

  basicParams: {
    title: "基本参数",
    titleHint: "（统一参数 · 两方共用）",
    sharedNote: "两侧共用同一套边界条件。",
    tilt: "组件安装倾角 (°)",
    yearlyHours: "年等效发电小时",
    hoursAutoHint: "选择气象后按 12 个月水平面辐照自动估算；可手工修改。",
    accessoryCost: "除组件外其他费用（每块）",
    accessoryCostHint: (currency: string) =>
      `项目总成本 = 组件 + 本项 × 块数。单位与结算单位一致（${currency}/块）。`,
    accessoryTotalPreview: (sym: string, total: string, count: string, perModule: number) =>
      `当前约 ${sym}${total} 除组件外其他费用（${count} 块 × ${perModule}）`,
    epcHelperTitle: "除组件外其他费用辅助填数（可选）",
    targetEpc: (currency: string) => `除组件外单价 (${currency}/Wp)`,
    epcPlaceholder: "例 0.6",
    applyAccessory: "应用到上方每块费用",
    epcSuggestion: (power: number, sym: string, suggested: string) =>
      `按当前隆基组件（${power}W）建议每块约 ${sym}${suggested}（单价 × 瓦数）`,
    operationYears: "运行年限 (年)",
    currency: "结算单位",
    currencySearch: "搜索币种…",
    currencySyncHint:
      "与首页右上角币种同步；切换时将按汇率换算 PPA、除组件外其他费用及组件库单价。",
    ppa: "PPA 电价 (每 kWh 数值)",
    ppaReference: (label: string) => `参考：${label}`,
    ppaWarning:
      "当前 PPA 偏离常见区间，回收期对电价极其敏感。若您按人民币习惯填数，请先将结算单位切为 CNY 再填 0.3～0.4 元/kWh，勿在 USD 下填相同数字。",
  },

  ppaReference: {
    USD: "美元分布式常见约 0.05～0.15",
    AUD: "澳元分布式常见约 0.05～0.15",
    NZD: "新西兰元常见约 0.05～0.15",
    CNY: "人民币常见约 0.25～0.45",
  },

  specs: {
    stepBadge: "第二步",
    title: "组件参数对比",
    subtitle: "点击参数行可编辑；缺省字段将标注默认值",
    modulePairPreset: "对比模式",
    modulePairPresetOptions: {
      custom: "常规比对（正常拉选组件）",
      bc475: "BC vs Topcon 475W",
      bc540: "BC 540W vs Topcon 510W",
      bc650: "BC 650W vs Topcon 620W",
    },
    presetHvhFallback: "未找到预设隆基型号，已自动选用同功率 HVH 版型",
    presetMissingPair: "未能完整匹配预设组件，请检查组件库",
    longiSelect: "隆基组件",
    competitorSelect: "竞品组件",
    selectPlaceholder: "从组件库选择...",
    selectSearch: "搜索型号或功率…",
    manuallyAdjusted: "已手动调整",
    editSheet: {
      title: (label: string) => `编辑 ${label}`,
      description: "修改仅影响本次对比会话；也可选择写回组件库永久保存。",
      unit: (hint: string) => ` 单位：${hint}`,
      apply: "应用（本次对比）",
      reset: "恢复组件库数值",
      saveToLibrary: "保存到组件库",
      appliedToast: "已应用本次对比参数",
      resetToast: "已恢复为组件库数值",
      noRecord: "无可用组件记录",
      fillOneSide: "请填写至少一侧数值",
    },
    fieldHints: {
      dimensions: "长×宽 mm，如 2278×1134",
    },
    versionFinder: {
      title: "按需求选型",
      subtitle:
        "勾选客户关注的功能（如防积灰、抗热斑），自动匹配对应隆基版型",
      powerBand: "功率档位",
      powerBandOptions: {
        475: "户用 475W",
        540: "中版型 540W",
        650: "大版型 650W",
      },
      needsLegend: "客户需求",
      needs: {
        antiHotspot: {
          label: "抗热斑 / 防起火",
          hint: "降低局部过热风险，减少热斑隐患",
        },
        antiDust: {
          label: "防积灰",
          hint: "优先匹配 HVHF / HVDF 防积灰边框版型",
        },
        antiGlare: {
          label: "防眩光",
          hint: "优先匹配非 F 的 HVH / HVD 防眩光版型",
        },
        antiShading: {
          label: "抗阴影遮挡",
          hint: "局部遮挡下减少功率损失",
        },
        lightweight: {
          label: "轻质版型",
          hint: "优先匹配 HVHL，适合承重受限屋顶",
        },
      },
      previewLabel: "推荐版型",
      previewEmpty: "当前功率档暂无匹配型号",
      partialMatch: "库中无完全匹配型号，已给出最接近版型",
      apply: "应用推荐版型",
      appliedToast: (model: string) => `已选用 ${model}`,
    },
  },

  specParams,

  results: {
    stepBadge: "测算结果",
    title: "计算结果（简化平均模型）",
    subtitle: (currency: string) =>
      `币种：${currency} · 明细表含首年售电收入与静态/动态回收期，可手算复核`,
    tableMetric: "指标",
    tableDelta: "比对量",
    exportPdf: "导出 PDF 报告",
    exportingPdf: "正在生成 PDF…",
    reset: "重新测算",
    emptyProjectNameWarning: "项目名称为空，报告将使用「未命名项目」作为文件名",
    pdfSuccess: "PDF 报告已下载",
    pdfFail: (msg: string) => `PDF 导出失败：${msg}`,
    displaySettings: {
      menuAria: "结果展示设置",
      sectionTable: "列表显示",
      sectionChart: "中间图表",
      middleChartProjectCost: "项目总成本",
      middleChartAccessory: "除组件外其他费用",
      middleChartNetProfit: "净收益",
      keepOneRow: "至少保留一项指标",
    },
    charts: {
      yield: {
        title: "全寿命预期发电量 (MWh)",
        hint: "越高越好 · 含运行期衰减",
        captionUp: "隆基相对竞品发电量提升",
        captionDown: "隆基相对竞品发电量低于竞品",
        tooltipDelta: (pct: string) => `较竞品 ${pct}`,
      },
      cost: {
        title: (sym: string) => `项目总成本 (${sym})`,
        hint: "越低越好",
        captionDown: "隆基相对竞品项目总成本降低",
        captionUp: "隆基相对竞品项目总成本高于竞品",
        tooltipDown: (pct: string) => `较竞品降低 ${pct}%`,
        tooltipUp: (pct: string) => `较竞品高出 ${pct}%`,
      },
      accessory: {
        title: (sym: string) => `除组件外其他费用 (${sym})`,
        hint: "越低越好 · 不含组件",
        captionDown: "隆基相对竞品除组件外其他费用降低",
        captionUp: "隆基相对竞品除组件外其他费用高于竞品",
        tooltipDown: (pct: string) => `较竞品降低 ${pct}%`,
        tooltipUp: (pct: string) => `较竞品高出 ${pct}%`,
      },
      netProfit: {
        title: (sym: string) => `净收益 (${sym})`,
        hint: "越高越好 · 全寿命售电收入减项目总成本",
        captionUp: "隆基相对竞品净收益提升",
        captionDown: "隆基相对竞品净收益低于竞品",
        tooltipDelta: (pct: string) => `较竞品 ${pct}`,
      },
      payback: {
        title: "全站投资回收期 (年)",
        hint: "越短越好 · 动态累计售电现金流",
        captionShorter: "隆基相对竞品投资回收期缩短",
        captionLonger: "隆基相对竞品投资回收期长于竞品",
        tooltipShorter: (years: string) => `较竞品缩短 ${years} 年`,
        tooltipLonger: (years: string) => `较竞品延长 ${years} 年`,
        formatBar: (years: string) => `${years} 年`,
      },
    },
  },

  resultMetrics,

  gain: {
    title: "发电增益策略",
    subtitle: "勾选后参与最终发电量与收益计算。",
    enabled: "已参与计算",
    disabled: "未参与计算",
    scenario: "场景",
    gainLabel: "发电量增益",
    counted: "计入",
    cards: {
      temperature: {
        title: "温度系数增益",
        description:
          "按 (|γ竞品| − |γ隆基|) × ΔT 估算隆基相对竞品的发电增益；ΔT 默认 25°C。",
      },
      antiShading: {
        title: "抗遮挡增益",
        description:
          "按场景（户用 / 工商业）计入隆基相对竞品的抗局部遮挡发电增益。",
      },
      lowLight: {
        title: "弱光增益",
        description: "有 PAN 时按 RelEffic 四点加权差值计算；无 PAN 时缺省 +0.8%。",
      },
    },
    scenarios: {
      residential: "户用",
      commercial: "工商业",
    } satisfies Record<AntiShadingScenario, string>,
    rules: {
      standard: "标准",
      conservative: "保守",
      pan: "PAN 数据",
    } satisfies Record<GainRuleId, string>,
    explainAria: {
      temperature: "查看温度系数原理讲解",
      antiShading: "查看抗遮挡原理讲解",
      lowLight: "查看弱光增益原理讲解",
    },
  },

  database: {
    title: "数据库管理",
    syncModules: "同步内置组件库",
    syncModulesSuccess: "已同步内置组件库（14 款隆基 + 10 款竞品）",
    syncWeather: "同步内置气象库",
    syncWeatherSuccess: "已同步内置澳新气象库",
    tabs: {
      longi: "隆基组件库",
      competitor: "竞品组件库",
      weather: "天气文件",
    },
    searchModules: "搜索型号或制造商...",
    importPan: "导入 .pan",
    importPanFolder: "导入 Panfile 文件夹",
    importCsv: "导入 CSV",
    importEpw: "导入 EPW",
    table: {
      model: "型号",
      power: "功率",
      dimensions: "尺寸",
      tempCoef: "温度系数",
      deg: "首年/年衰减",
      price: (currency: string) => `单价 (${currency}/W)`,
      name: "名称",
      location: "地点",
      yearlyHours: "年等效小时",
    },
    editor: {
      newModule: "新增组件",
      editModule: (model: string) => `编辑 ${model}`,
      fillAndSave: (lib: string) => `填写组件参数并保存到${lib}`,
      basicInfo: "基本信息",
      manufacturer: "制造商",
      model: "型号",
      powerAndSize: "功率与尺寸",
      powerWp: "功率 (Wp)",
      length: "长度 (mm)",
      width: "宽度 (mm)",
      stcParams: "STC 电参数",
      stcHint: "用于体现组件专业性；对比页规格表不展示下列字段。",
      electrical: "电气与衰减",
      electricalHint: "若 Pan / Datasheet 未包含下列参数，可在此手动补全。",
      pmpTempCoef: "Pmp 温度系数 (%/°C)",
      firstYearDeg: "首年衰减 (%)",
      annualDeg: "年衰减 (%)",
      pricing: "价格",
      unitPrice: (currency: string) => `单价 (${currency}/W)`,
    },
    libraryLabel: {
      longi: "隆基组件库",
      competitor: "竞品组件库",
    },
    defaultCompetitorName: "竞品",
    moduleSaved: "组件已保存",
    moduleDeleted: "已删除",
    noPanFiles: "未找到 .pan 文件",
    panImportDone: (ok: number, fail: number) =>
      `Panfile 导入完成：成功 ${ok}，失败/需补全 ${fail}`,
    csvImported: (n: number) => `已导入 ${n} 条组件`,
    csvParseFail: "未能解析 CSV",
    epwImported: (name: string) => `已导入气象：${name}`,
    epwParseFail: "EPW 解析失败",
    saveIncomplete: (missing: string) =>
      `已保存，但尚缺：${missing}，对比测算将使用默认值直至补全`,
    importIncomplete: (file: string, errs: string) =>
      `${file}: ${errs}（已导入，请编辑补全）`,
    emptyTable: "暂无数据，请导入或新增",
  },

  legal: {
    attribution: (developer: string, support: string) =>
      `开发者：${developer} · 技术支持：${support}`,
    feedbackLabel: "反馈与建议",
    feedback: (email: string) => `反馈与建议：${email}`,
    internalNotice:
      "本工具为隆基绿能内部专用，严禁外发（不得向客户、第三方或公开渠道传播，含截图、转发、上传公网）。",
    referenceOnly:
      "测算与报告结果仅供参考，不构成投资建议、正式工程承诺或合同依据。",
    ipNotice: (developer: string) =>
      `本工具界面、算法、报告版式及数据组织等知识产权归隆基绿能所有；未经授权不得复制、修改或传播。软件开发署名：${developer}。`,
    combinedFooter: (developer: string) =>
      `本工具为隆基绿能内部专用，严禁外发。测算与报告结果仅供参考，不构成投资建议或正式工程承诺。界面、算法、报告版式等知识产权归隆基绿能所有；未经授权不得复制或传播。软件开发署名：${developer}。`,
    noExternalDistribution: "严禁外发",
  },

  report: {
    title: "隆基智能光伏 · 对比测算报告",
    subtitle: "全生命周期增益测算（简化平均模型）",
    disclaimer:
      "【内部专用·严禁外发】本报告由隆基智能光伏测算工具自动生成，仅供内部销售与技术沟通参考；结果仅供参考，不构成投资建议、正式工程承诺或合同依据。测算基于用户输入参数、所选气象站及组件库数据，采用简化平均模型；全站投资回收期为组件与按块分摊的系统成本之和，按运行年限内逐年售电收入（含衰减）动态累计至回本，未含运维 OPEX 与税费。PPA 与组件单价须与所选结算单位一致，回收期对电价高度敏感（勿将人民币电价填在美元单位下）。竞品参数来源于公开资料、PAN 文件或用户导入，请以最新官方规格为准。",
    watermark: "内部资料 · 严禁外发 · 仅供参考",
    comparisonModes: {
      sameCount: "同片数对比",
      fixedCapacity: "固定装机量对比",
    },
    noWeather: "未选择气象站",
    gainIncluded: (rule: string, pct: string) =>
      `已参与 · 规则：${rule} · 计入 ${pct}`,
    gainIncludedWithScenario: (rule: string, scenario: string, pct: string) =>
      `已参与 · 规则：${rule} · 场景：${scenario} · 计入 ${pct}`,
    gainExcluded: "未参与计算",
    highlights: {
      yieldGain: "发电量增益",
      projectCost: "项目总成本",
      accessoryCost: "除组件外其他费用",
      netProfit: "净收益",
      payback: "全站投资回收期",
    },
    basicParamLabels: {
      tilt: "倾角",
      yearlyHours: "年等效利用小时",
      operationYears: "运维年限",
      ppa: "PPA 电价",
      accessory: "除组件外其他费用（每块）",
      ppaRef: "PPA 参考区间",
      ppaRefValue: (currency: string) => `${currency} 常见见工具内提示`,
    },
    projectFields: {
      name: "项目名称",
      generatedAt: "生成时间",
      weather: "气象站",
      comparisonMode: "对比模式",
      scale: "规模",
      currency: "货币",
      metrics: "指标对照",
      footer: (version: string, at: string) =>
        `工具版本 ${version} · ${at}`,
    },
    sections: {
      project: "项目信息",
      basicParams: "基础参数",
      modules: "对比组件",
      gainStrategies: "发电增益策略",
      highlights: "核心结论",
      results: "测算结果",
      disclaimer: "免责声明",
    },
    specTable: {
      model: "型号",
      displayName: "显示名",
      power: "功率",
      dimensions: "尺寸",
      tempCoef: "温度系数",
      firstYearDeg: "首年衰减",
      annualDeg: "年衰减率",
      price: "单瓦价格",
    },
  },

  toast: {
    currencySwitched: (label: string) =>
      `已切换为 ${label}，相关金额已按汇率换算`,
    fillOneSide: "请填写至少一侧数值",
    savedToLibrary: "已保存到组件库",
    saveFailed: (label: string, errs: string) => `${label}：${errs}`,
    saveWarning: (label: string, missing: string) =>
      `${label}：已保存，尚缺 ${missing}，对比测算将用默认值直至补全`,
  },

  chart: {
    longi: "隆基",
    competitor: "竞品",
  },

  login: {
    title: "访问测算工具",
    subtitle: "请输入您的授权访问码",
    codeLabel: "访问码",
    submit: "进入",
    submitting: "验证中…",
    invalidCode: "访问码无效，请检查后重试或联系 LONGi 获取授权",
    serverError: "服务暂不可用，请稍后重试",
    configError: "访问控制未配置，请联系管理员",
    footer: "授权访问 · 请勿对外传播访问码",
  },
} as const;

/** 将 zh 文案结构的字面量放宽为 string，供 en 等语言复用同一形状 */
type DeepStringify<T> = T extends (...args: infer A) => string
  ? (...args: A) => string
  : T extends readonly (infer U)[]
    ? readonly DeepStringify<U>[]
    : T extends object
      ? { [K in keyof T]: DeepStringify<T[K]> }
      : T extends string
        ? string
        : T;

export type Messages = DeepStringify<typeof zhMessages>;
