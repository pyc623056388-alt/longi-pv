import type { Messages } from "./zh";

export const enMessages: Messages = {
  locale: "en",
  numberLocale: "en-AU",
  htmlLang: "en",

  common: {
    database: "Database",
    longi: "LONGi",
    competitor: "Competitor",
    longiModule: "LONGi module",
    competitorModule: "Competitor module",
    defaultValue: "Default",
    notSet: "Not set",
    vs: "vs",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    confirmDelete: "Delete this item?",
    confirmDeleteModule: "Delete this module?",
    unnamedProject: "Untitled project",
    yearUnit: "yr",
    panelUnit: "modules",
    modules: "modules",
    perModuleUnit: "module",
    pricePerPanelApprox: (sym: string, amount: string) =>
      `≈ ${sym}${amount}/module`,
    prevPage: "Previous",
    nextPage: "Next",
    pendingCompletion: "Incomplete",
    actions: "Actions",
  },

  hero: {
    titleLine1: "LONGi Smart PV",
    titleLine2: "Lifecycle Gain Calculator",
    subtitle: "ROI assessment from real project inputs and weather data",
    scrollHint: "Scroll down to start",
    advantages: {
      temperature: {
        title: "Temperature coefficient",
        description: "More stable output and controlled degradation in hot conditions",
        alt: "Temperature coefficient advantage illustration",
      },
      antiShading: {
        title: "Strong anti-shading performance",
        description: "Maintains higher energy yield under partial shading",
        alt: "Anti-shading advantage illustration",
      },
      lowLight: {
        title: "Low-light performance",
        description: "Better yield at dawn, dusk, and under cloudy skies",
        alt: "Low-light performance advantage illustration",
      },
    },
  },

  setup: {
    stepBadge: "Step 1",
    title: "Project setup",
    subtitle: "Configure project details and comparison mode",
    projectName: "Project name",
    projectNamePlaceholder: "Enter project name…",
    weather: "Weather station",
    weatherPlaceholder: "Select weather station…",
    weatherSearch: "Search station or location…",
    comparisonModeTitle: "Comparison mode",
    modes: {
      sameCount: {
        title: "Same module count",
        desc: "Compare energy yield with the same number of modules",
      },
      fixedCapacity: {
        title: "Fixed DC capacity",
        desc: "Compare system cost at the same installed capacity",
      },
    },
    moduleCountLabel: "Module count",
    capacityLabel: "Installed capacity (kW)",
  },

  basicParams: {
    title: "Basic parameters",
    titleHint: "(shared by both sides)",
    sharedNote: "Both sides use the same boundary conditions.",
    tilt: "Module tilt (°)",
    yearlyHours: "Annual equivalent hours",
    hoursAutoHint:
      "Estimated from 12-month horizontal irradiance after selecting weather; you may override.",
    accessoryCost: "Other cost per module (excl. modules)",
    accessoryCostHint: (currency: string) =>
      `Project cost = modules + this line × count. Units match settlement currency (${currency}/module).`,
    accessoryTotalPreview: (sym: string, total: string, count: string, perModule: number) =>
      `Approx. ${sym}${total} other cost excl. modules (${count} modules × ${perModule})`,
    epcHelperTitle: "Other cost helper (optional)",
    targetEpc: (currency: string) => `Other cost rate (${currency}/Wp)`,
    epcPlaceholder: "e.g. 0.6",
    applyAccessory: "Apply to field above",
    epcSuggestion: (power: number, sym: string, suggested: string) =>
      `Based on current LONGi module (${power} W), suggested ${sym}${suggested}/module (rate × watts)`,
    operationYears: "Operating life (years)",
    currency: "Settlement currency",
    currencySearch: "Search currency…",
    currencySyncHint:
      "Synced with the header currency; PPA, other cost excl. modules, and library prices convert on change.",
    ppa: "PPA price (per kWh)",
    ppaReference: (label: string) => `Reference: ${label}`,
    ppaWarning:
      "PPA is outside typical ranges; payback is highly price-sensitive. If you think in CNY, switch to CNY and enter ~0.3–0.4 CNY/kWh—do not enter the same number under USD.",
  },

  ppaReference: {
    USD: "Typical US/AU distributed solar ~0.05–0.15",
    AUD: "Typical AU distributed solar ~0.05–0.15",
    NZD: "Typical NZ distributed solar ~0.05–0.15",
    CNY: "Typical China ~0.25–0.45 CNY/kWh",
  },

  specs: {
    stepBadge: "Step 2",
    title: "Module comparison",
    subtitle: "Tap a row to edit; missing fields show default values",
    modulePairPreset: "Comparison mode",
    modulePairPresetOptions: {
      custom: "Standard (manual module pick)",
      bc475: "BC vs Topcon 475W",
      bc540: "BC 540W vs Topcon 510W",
      bc650: "BC 650W vs Topcon 620W",
    },
    presetHvhFallback:
      "Preset LONGi model not found; selected same-power HVH variant",
    presetMissingPair: "Could not fully match preset modules; check library",
    longiSelect: "LONGi module",
    competitorSelect: "Competitor module",
    selectPlaceholder: "Select from library…",
    selectSearch: "Search model or power…",
    manuallyAdjusted: "Adjusted for this run",
    editSheet: {
      title: (label: string) => `Edit ${label}`,
      description:
        "Changes apply to this session only; you can also save back to the library.",
      unit: (hint: string) => ` Unit: ${hint}`,
      apply: "Apply (this comparison)",
      reset: "Restore library values",
      saveToLibrary: "Save to library",
      appliedToast: "Applied for this comparison",
      resetToast: "Restored library values",
      noRecord: "No module record available",
      fillOneSide: "Enter a value on at least one side",
    },
    fieldHints: {
      dimensions: "L×W mm, e.g. 2278×1134",
    },
  },

  specParams: {
    power: "Module power",
    dimensions: "Dimensions",
    tempCoef: "Temperature coefficient",
    firstYearDeg: "Year-1 degradation",
    annualDeg: "Annual degradation",
    price: "Price per watt",
  },

  results: {
    stepBadge: "Results",
    title: "Results (simplified average model)",
    subtitle: (currency: string) =>
      `Currency: ${currency} · Table includes year-1 revenue and static/dynamic payback for cross-check`,
    tableMetric: "Metric",
    tableDelta: "Delta",
    exportPdf: "Export PDF report",
    exportingPdf: "Generating PDF…",
    reset: "Start over",
    emptyProjectNameWarning:
      'Project name is empty; the report file will use "Untitled project"',
    pdfSuccess: "PDF report downloaded",
    pdfFail: (msg: string) => `PDF export failed: ${msg}`,
    displaySettings: {
      menuAria: "Results display settings",
      sectionTable: "Table rows",
      sectionChart: "Middle chart",
      middleChartProjectCost: "Total project cost",
      middleChartAccessory: "Other cost (excl. modules)",
      middleChartNetProfit: "Net profit",
      keepOneRow: "Keep at least one metric visible",
    },
    charts: {
      yield: {
        title: "Lifetime energy (MWh)",
        hint: "Higher is better · includes degradation",
        captionUp: "LONGi yield vs competitor",
        captionDown: "LONGi yield below competitor",
        tooltipDelta: (pct: string) => `vs competitor ${pct}`,
      },
      cost: {
        title: (sym: string) => `Total project cost (${sym})`,
        hint: "Lower is better",
        captionDown: "LONGi total cost below competitor",
        captionUp: "LONGi total cost above competitor",
        tooltipDown: (pct: string) => `${pct}% lower vs competitor`,
        tooltipUp: (pct: string) => `${pct}% higher vs competitor`,
      },
      accessory: {
        title: (sym: string) => `Other cost excl. modules (${sym})`,
        hint: "Lower is better · excl. modules",
        captionDown: "LONGi other cost below competitor",
        captionUp: "LONGi other cost above competitor",
        tooltipDown: (pct: string) => `${pct}% lower vs competitor`,
        tooltipUp: (pct: string) => `${pct}% higher vs competitor`,
      },
      netProfit: {
        title: (sym: string) => `Net profit (${sym})`,
        hint: "Higher is better · lifetime revenue minus project cost",
        captionUp: "LONGi net profit above competitor",
        captionDown: "LONGi net profit below competitor",
        tooltipDelta: (pct: string) => `vs competitor ${pct}`,
      },
      payback: {
        title: "Plant payback (years)",
        hint: "Shorter is better · dynamic cumulative revenue",
        captionShorter: "LONGi payback shorter than competitor",
        captionLonger: "LONGi payback longer than competitor",
        tooltipShorter: (years: string) => `${years} yr shorter vs competitor`,
        tooltipLonger: (years: string) => `${years} yr longer vs competitor`,
        formatBar: (years: string) => `${years} yr`,
      },
    },
  },

  resultMetrics: {
    moduleCount: "Module count",
    capacity: "Installed capacity (kW)",
    firstYearYield: "Year-1 energy (MWh)",
    lifetimeYield: "Lifetime energy (MWh)",
    firstYearRevenue: "Year-1 revenue",
    lifetimeRevenue: "Lifetime revenue",
    moduleCost: "Module cost",
    accessoryCost: "Other cost excl. modules",
    projectCost: "Total project cost",
    netProfit: "Net profit",
    staticPayback: "Static payback (yr)",
    dynamicPayback: "Plant payback (yr)",
  },

  gain: {
    title: "Yield gain strategies",
    subtitle: "When enabled, included in final energy and revenue.",
    enabled: "Included",
    disabled: "Excluded",
    scenario: "Scenario",
    gainLabel: "Yield gain",
    counted: "Applied",
    cards: {
      temperature: {
        title: "Temperature coefficient gain",
        description:
          "Estimates LONGi vs competitor gain from (|γcomp| − |γLONGi|) × ΔT; default ΔT = 25°C.",
      },
      antiShading: {
        title: "Anti-shading gain",
        description:
          "Adds LONGi vs competitor gain for partial shading by residential or C&I scenario.",
      },
      lowLight: {
        title: "Low-light gain",
        description:
          "With PAN: weighted RelEffic difference; without PAN: default +0.8%.",
      },
    },
    scenarios: {
      residential: "Residential",
      commercial: "C&I",
    },
    rules: {
      standard: "Standard",
      conservative: "Conservative",
      pan: "PAN data",
    },
    explainAria: {
      temperature: "Temperature coefficient explanation",
      antiShading: "Anti-shading explanation",
      lowLight: "Low-light gain explanation",
    },
  },

  database: {
    title: "Database",
    syncModules: "Sync built-in modules",
    syncModulesSuccess: "Built-in library synced (14 LONGi + 10 competitor)",
    syncWeather: "Sync built-in weather",
    syncWeatherSuccess: "Built-in AU/NZ weather library synced",
    tabs: {
      longi: "LONGi library",
      competitor: "Competitor library",
      weather: "Weather files",
    },
    searchModules: "Search model or manufacturer…",
    importPan: "Import .pan",
    importPanFolder: "Import Panfile folder",
    importCsv: "Import CSV",
    importEpw: "Import EPW",
    table: {
      model: "Model",
      power: "Power",
      dimensions: "Dimensions",
      tempCoef: "Temp. coef.",
      deg: "Y1 / annual deg.",
      price: (currency: string) => `Price (${currency}/W)`,
      name: "Name",
      location: "Location",
      yearlyHours: "Equiv. hours",
    },
    editor: {
      newModule: "New module",
      editModule: (model: string) => `Edit ${model}`,
      fillAndSave: (lib: string) => `Enter parameters and save to ${lib}`,
      basicInfo: "Basic info",
      manufacturer: "Manufacturer",
      model: "Model",
      powerAndSize: "Power & size",
      powerWp: "Power (Wp)",
      length: "Length (mm)",
      width: "Width (mm)",
      stcParams: "STC electrical",
      stcHint: "Professional detail; not shown on the comparison table.",
      electrical: "Electrical & degradation",
      electricalHint: "Fill manually if missing from PAN / datasheet.",
      pmpTempCoef: "Pmp temp. coef. (%/°C)",
      firstYearDeg: "Year-1 degradation (%)",
      annualDeg: "Annual degradation (%)",
      pricing: "Pricing",
      unitPrice: (currency: string) => `Unit price (${currency}/W)`,
    },
    libraryLabel: {
      longi: "LONGi library",
      competitor: "Competitor library",
    },
    defaultCompetitorName: "Competitor",
    moduleSaved: "Module saved",
    moduleDeleted: "Deleted",
    noPanFiles: "No .pan files found",
    panImportDone: (ok: number, fail: number) =>
      `Panfile import: ${ok} OK, ${fail} failed / need completion`,
    csvImported: (n: number) => `Imported ${n} modules`,
    csvParseFail: "Could not parse CSV",
    epwImported: (name: string) => `Weather imported: ${name}`,
    epwParseFail: "EPW parse failed",
    saveIncomplete: (missing: string) =>
      `Saved, but missing: ${missing}. Defaults used until completed.`,
    importIncomplete: (file: string, errs: string) =>
      `${file}: ${errs} (imported—please complete in editor)`,
    emptyTable: "No data yet—import or add a record",
  },

  legal: {
    attribution: (developer: string, support: string) =>
      `Developer: ${developer} · Technical support: ${support}`,
    feedbackLabel: "Feedback",
    feedback: (email: string) => `Feedback: ${email}`,
    internalNotice:
      "For LONGi internal use only. Do not distribute externally (no sharing with customers, third parties, or public channels—including screenshots, forwarding, or uploading online).",
    referenceOnly:
      "Calculation and report outputs are for reference only and do not constitute investment advice, formal engineering commitments, or contractual basis.",
    ipNotice: (developer: string) =>
      `UI, algorithms, report layout, and data organization are intellectual property of LONGi Green Energy Technology Co., Ltd. Unauthorized copying, modification, or distribution is prohibited. Software development credit: ${developer}.`,
    combinedFooter: (developer: string) =>
      `LONGi internal use only—do not distribute externally. Results are for reference only, not investment or engineering advice. UI, algorithms, and report layout are LONGi IP; unauthorized copying or distribution is prohibited. Software development credit: ${developer}.`,
    noExternalDistribution: "Do not distribute externally",
  },

  report: {
    title: "LONGi Smart PV · Comparison Report",
    subtitle: "Lifecycle gain assessment (simplified average model)",
    disclaimer:
      "[Internal only—do not distribute] Auto-generated by the LONGi PV calculator for internal sales and technical discussion only; outputs are for reference only and do not constitute investment advice, formal engineering commitments, or contractual basis. Based on user inputs, selected weather, and module library data using a simplified average model. Plant payback sums module and per-module BOS costs against yearly revenue (with degradation) over the operating period; excludes O&M and tax. PPA and module prices must match the selected currency—payback is highly price-sensitive (do not enter CNY values under USD). Competitor data may come from public sources, PAN files, or imports—verify against latest official specs.",
    watermark: "Internal · do not distribute · reference only",
    comparisonModes: {
      sameCount: "Same module count",
      fixedCapacity: "Fixed DC capacity",
    },
    noWeather: "No weather station selected",
    gainIncluded: (rule: string, pct: string) =>
      `On · rule: ${rule} · applied ${pct}`,
    gainIncludedWithScenario: (rule: string, scenario: string, pct: string) =>
      `On · rule: ${rule} · scenario: ${scenario} · applied ${pct}`,
    gainExcluded: "Excluded",
    highlights: {
      yieldGain: "Yield gain",
      projectCost: "Total project cost",
      accessoryCost: "Other cost excl. modules",
      netProfit: "Net profit",
      payback: "Plant payback",
    },
    basicParamLabels: {
      tilt: "Tilt",
      yearlyHours: "Annual equivalent hours",
      operationYears: "Operating life",
      ppa: "PPA price",
      accessory: "Other cost per module (excl. modules)",
      ppaRef: "PPA reference",
      ppaRefValue: (currency: string) => `Typical ${currency} range—see in-app hint`,
    },
    projectFields: {
      name: "Project name",
      generatedAt: "Generated",
      weather: "Weather station",
      comparisonMode: "Comparison mode",
      scale: "Scale",
      currency: "Currency",
      metrics: "Metrics",
      footer: (version: string, at: string) => `Tool v${version} · ${at}`,
    },
    sections: {
      project: "Project",
      basicParams: "Basic parameters",
      modules: "Compared modules",
      gainStrategies: "Yield gain strategies",
      highlights: "Key takeaways",
      results: "Results",
      disclaimer: "Disclaimer",
    },
    specTable: {
      model: "Model",
      displayName: "Display name",
      power: "Power",
      dimensions: "Dimensions",
      tempCoef: "Temp. coef.",
      firstYearDeg: "Year-1 deg.",
      annualDeg: "Annual deg.",
      price: "Price per W",
    },
  },

  toast: {
    currencySwitched: (label: string) =>
      `Switched to ${label}; amounts converted at current FX rates`,
    fillOneSide: "Enter a value on at least one side",
    savedToLibrary: "Saved to library",
    saveFailed: (label: string, errs: string) => `${label}: ${errs}`,
    saveWarning: (label: string, missing: string) =>
      `${label}: saved; missing ${missing}—defaults used until completed`,
  },

  chart: {
    longi: "LONGi",
    competitor: "Competitor",
  },
};
