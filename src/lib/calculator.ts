export type SetupType = "earthen-pond" | "concrete-pond" | "tank";
export type FishType = "catfish" | "tilapia";
export type CalculatorMode = "feed-planner" | "stock-density" | "pond-size";

export type CalculatorInputs = {
  setupType: SetupType;
  fishType: FishType;
  numberOfFish: string;
  targetWeightGrams: string;
  length: string;
  width: string;
  depth: string;
};

export type FeedCycle = {
  stage: string;
  durationWeeks: number;
  weightRangeGrams: [number, number];
  feedRate: number;
  feedSize: string;
};

export type CalculatorOption = {
  value: CalculatorMode;
  label: string;
  description: string;
  bestFor: string;
};

export type GeometryResult = {
  fishCount: number;
  targetWeightKg: number;
  lengthValue: number;
  widthValue: number;
  depthValue: number;
  surfaceArea: number;
  waterVolume: number;
  stockingGuide: (typeof stockingGuides)[SetupType];
  measurementBase: number;
  measurementLabel: string;
  measurementUnit: "m2" | "m3";
};

export type FeedPlannerResult = {
  bagSizeKg: number;
  totalProgramFeedKg: number;
  peakDailyFeedKg: number;
  estimatedFeedBags: number;
  bagsToBuy: number;
  feedRows: Array<
    FeedCycle & {
      dailyFeedKg: number;
      cycleFeedKg: number;
      cycleFeedBags: number;
    }
  >;
};

export type DensityAdjustment = {
  baseDensity: number;
  adjustedDensity: number;
  adjustmentFactor: number;
  referenceWeightKg: number;
};

export type StockDensityResult = DensityAdjustment & {
  recommendedFingerlings: number;
  projectedHarvestBiomassKg: number;
};

export type PondSizeResult = DensityAdjustment & {
  requiredMeasurementBase: number;
  requiredSurfaceArea: number;
  requiredWaterVolume: number;
  projectedHarvestBiomassKg: number;
  suggestedLength: number;
  suggestedWidth: number;
};

export const setupOptions: Array<{ value: SetupType; label: string }> = [
  { value: "earthen-pond", label: "Earthen Pond" },
  { value: "concrete-pond", label: "Concrete Pond" },
  { value: "tank", label: "Tank" },
];

export const fishOptions: Array<{ value: FishType; label: string }> = [
  { value: "catfish", label: "Catfish" },
  { value: "tilapia", label: "Tilapia" },
];

export const calculatorOptions: CalculatorOption[] = [
  {
    value: "feed-planner",
    label: "Feed Planner",
    description: "Estimate feed quantity, feeding stages, and feed bag needs.",
    bestFor: "Best for farmers who already know the number of fish they want to rear.",
  },
  {
    value: "stock-density",
    label: "Stock Density",
    description: "Estimate how many fingerlings your pond or tank can hold well.",
    bestFor: "Best for ponds you already built and want to stock at the right level.",
  },
  {
    value: "pond-size",
    label: "Pond Size",
    description: "Estimate the pond or tank size you need for your stocking plan.",
    bestFor: "Best for planning a new pond or tank before you start stocking fish.",
  },
];

export const feedPrograms: Record<FishType, FeedCycle[]> = {
  catfish: [
    {
      stage: "Young Starter",
      durationWeeks: 3,
      weightRangeGrams: [2, 10],
      feedRate: 0.08,
      feedSize: "0.8 - 1 mm",
    },
    {
      stage: "Fingerling",
      durationWeeks: 4,
      weightRangeGrams: [10, 50],
      feedRate: 0.06,
      feedSize: "1.5 - 2 mm",
    },
    {
      stage: "Juvenile",
      durationWeeks: 5,
      weightRangeGrams: [50, 150],
      feedRate: 0.045,
      feedSize: "2 - 3 mm",
    },
    {
      stage: "Grow-out",
      durationWeeks: 6,
      weightRangeGrams: [150, 400],
      feedRate: 0.03,
      feedSize: "4 mm",
    },
    {
      stage: "Mature",
      durationWeeks: 8,
      weightRangeGrams: [400, 900],
      feedRate: 0.02,
      feedSize: "6 mm",
    },
  ],
  tilapia: [
    {
      stage: "Young Starter",
      durationWeeks: 3,
      weightRangeGrams: [1, 5],
      feedRate: 0.1,
      feedSize: "0.5 - 0.8 mm",
    },
    {
      stage: "Fingerling",
      durationWeeks: 4,
      weightRangeGrams: [5, 30],
      feedRate: 0.07,
      feedSize: "1 - 1.5 mm",
    },
    {
      stage: "Juvenile",
      durationWeeks: 5,
      weightRangeGrams: [30, 120],
      feedRate: 0.045,
      feedSize: "2 mm",
    },
    {
      stage: "Grow-out",
      durationWeeks: 6,
      weightRangeGrams: [120, 250],
      feedRate: 0.03,
      feedSize: "3 mm",
    },
    {
      stage: "Mature",
      durationWeeks: 8,
      weightRangeGrams: [250, 500],
      feedRate: 0.02,
      feedSize: "4 - 6 mm",
    },
  ],
};

export const stockingGuides = {
  "earthen-pond": {
    unit: "m2",
    densityLabel: "fish per m2 of surface area",
    notes: "Earthen ponds are planned mainly from surface area, with healthy water depth and good pond management.",
    densityByFish: {
      catfish: 6,
      tilapia: 4,
    },
  },
  "concrete-pond": {
    unit: "m3",
    densityLabel: "fish per m3 of water volume",
    notes: "Concrete ponds can carry more fish when water exchange and aeration are steady.",
    densityByFish: {
      catfish: 18,
      tilapia: 10,
    },
  },
  tank: {
    unit: "m3",
    densityLabel: "fish per m3 of water volume",
    notes: "Tanks assume active aeration and tighter daily water quality management.",
    densityByFish: {
      catfish: 28,
      tilapia: 16,
    },
  },
} satisfies Record<
  SetupType,
  {
    unit: "m2" | "m3";
    densityLabel: string;
    notes: string;
    densityByFish: Record<FishType, number>;
  }
>;

export const fishProfiles = {
  catfish: {
    defaultTargetWeightGrams: "900",
    referenceHarvestWeightKg: 0.9,
    targetHint: "Typical grow-out target: 700g to 1200g",
  },
  tilapia: {
    defaultTargetWeightGrams: "500",
    referenceHarvestWeightKg: 0.5,
    targetHint: "Typical grow-out target: 250g to 600g",
  },
} satisfies Record<
  FishType,
  {
    defaultTargetWeightGrams: string;
    referenceHarvestWeightKg: number;
    targetHint: string;
  }
>;

export const defaultCalculatorMode: CalculatorMode = "feed-planner";

export const defaultCalculatorInputs: CalculatorInputs = {
  setupType: "earthen-pond",
  fishType: "catfish",
  numberOfFish: "250",
  targetWeightGrams: fishProfiles.catfish.defaultTargetWeightGrams,
  length: "10",
  width: "5",
  depth: "1.2",
};

export const calculatorFieldsByMode: Record<CalculatorMode, Array<keyof CalculatorInputs>> = {
  "feed-planner": ["fishType", "numberOfFish"],
  "stock-density": ["setupType", "fishType", "length", "width", "depth", "targetWeightGrams"],
  "pond-size": ["setupType", "fishType", "numberOfFish", "targetWeightGrams", "depth"],
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const standardFeedBagSizeKg = 20;

export const parseNumber = (value: string) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatInteger = (value: number) => integerFormatter.format(value);

export const getSuggestedFootprint = (surfaceArea: number) => {
  if (surfaceArea <= 0) {
    return {
      suggestedLength: 0,
      suggestedWidth: 0,
    };
  }

  const suggestedWidth = Math.sqrt(surfaceArea / 2);
  const suggestedLength = suggestedWidth * 2;

  return {
    suggestedLength,
    suggestedWidth,
  };
};

export const getAdjustedDensity = (
  setupType: SetupType,
  fishType: FishType,
  targetWeightKg: number,
): DensityAdjustment => {
  const baseDensity = stockingGuides[setupType].densityByFish[fishType];

  if (targetWeightKg <= 0) {
    return {
      baseDensity,
      adjustedDensity: 0,
      adjustmentFactor: 0,
      referenceWeightKg: fishProfiles[fishType].referenceHarvestWeightKg,
    };
  }

  const referenceWeightKg = fishProfiles[fishType].referenceHarvestWeightKg;
  const adjustmentFactor = clamp(Math.pow(referenceWeightKg / targetWeightKg, 0.85), 0.45, 2);

  return {
    baseDensity,
    adjustedDensity: baseDensity * adjustmentFactor,
    adjustmentFactor,
    referenceWeightKg,
  };
};

export const calculateGeometry = (values: CalculatorInputs): GeometryResult => {
  const fishCount = parseNumber(values.numberOfFish);
  const targetWeightKg = parseNumber(values.targetWeightGrams) / 1000;
  const lengthValue = parseNumber(values.length);
  const widthValue = parseNumber(values.width);
  const depthValue = parseNumber(values.depth);
  const surfaceArea = lengthValue * widthValue;
  const waterVolume = surfaceArea * depthValue;
  const stockingGuide = stockingGuides[values.setupType];
  const measurementBase = stockingGuide.unit === "m2" ? surfaceArea : waterVolume;
  const measurementLabel = stockingGuide.unit === "m2" ? "Usable surface area" : "Usable water volume";
  const measurementUnit = stockingGuide.unit;

  return {
    fishCount,
    targetWeightKg,
    lengthValue,
    widthValue,
    depthValue,
    surfaceArea,
    waterVolume,
    stockingGuide,
    measurementBase,
    measurementLabel,
    measurementUnit,
  };
};

export const calculateFeedPlanner = (fishType: FishType, fishCount: number): FeedPlannerResult => {
  const bagSizeKg = standardFeedBagSizeKg;
  const feedRows = feedPrograms[fishType].map((cycle) => {
    const averageWeightKg = (cycle.weightRangeGrams[0] + cycle.weightRangeGrams[1]) / 2 / 1000;
    const dailyFeedKg = fishCount * averageWeightKg * cycle.feedRate;
    const cycleFeedKg = dailyFeedKg * cycle.durationWeeks * 7;
    const cycleFeedBags = bagSizeKg > 0 ? cycleFeedKg / bagSizeKg : 0;

    return {
      ...cycle,
      dailyFeedKg,
      cycleFeedKg,
      cycleFeedBags,
    };
  });

  const totalProgramFeedKg = feedRows.reduce((sum, cycle) => sum + cycle.cycleFeedKg, 0);
  const peakDailyFeedKg = Math.max(...feedRows.map((cycle) => cycle.dailyFeedKg), 0);
  const estimatedFeedBags = bagSizeKg > 0 ? totalProgramFeedKg / bagSizeKg : 0;
  const bagsToBuy = estimatedFeedBags > 0 ? Math.ceil(estimatedFeedBags) : 0;

  return {
    bagSizeKg,
    totalProgramFeedKg,
    peakDailyFeedKg,
    estimatedFeedBags,
    bagsToBuy,
    feedRows,
  };
};

export const calculateStockDensity = (
  setupType: SetupType,
  fishType: FishType,
  geometry: GeometryResult,
): StockDensityResult => {
  const density = getAdjustedDensity(setupType, fishType, geometry.targetWeightKg);
  const recommendedFingerlings = geometry.measurementBase * density.adjustedDensity;
  const projectedHarvestBiomassKg = recommendedFingerlings * geometry.targetWeightKg;

  return {
    ...density,
    recommendedFingerlings,
    projectedHarvestBiomassKg,
  };
};

export const calculatePondSize = (
  setupType: SetupType,
  fishType: FishType,
  geometry: GeometryResult,
): PondSizeResult => {
  const density = getAdjustedDensity(setupType, fishType, geometry.targetWeightKg);
  const requiredMeasurementBase = density.adjustedDensity > 0 ? geometry.fishCount / density.adjustedDensity : 0;
  const requiredSurfaceArea =
    geometry.stockingGuide.unit === "m2"
      ? requiredMeasurementBase
      : geometry.depthValue > 0
        ? requiredMeasurementBase / geometry.depthValue
        : 0;
  const requiredWaterVolume =
    geometry.stockingGuide.unit === "m2" ? requiredSurfaceArea * geometry.depthValue : requiredMeasurementBase;
  const footprint = getSuggestedFootprint(requiredSurfaceArea);
  const projectedHarvestBiomassKg = geometry.fishCount * geometry.targetWeightKg;

  return {
    ...density,
    requiredMeasurementBase,
    requiredSurfaceArea,
    requiredWaterVolume,
    projectedHarvestBiomassKg,
    ...footprint,
  };
};
