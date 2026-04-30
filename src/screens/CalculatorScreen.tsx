import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  AlertTriangle,
  Calculator,
  Droplets,
  Fish,
  RefreshCcw,
  Ruler,
  Scale,
} from "lucide-react-native";
import { TankSizePreview } from "@/components/calculator/TankSizePreview";
import { AppText, Button, Card, Screen, SectionHeading, TextField } from "@/components/ui";
import {
  calculateFeedPlanner,
  calculateGeometry,
  calculatePondSize,
  calculateStockDensity,
  calculatorFieldsByMode,
  calculatorOptions,
  defaultCalculatorInputs,
  defaultCalculatorMode,
  fishOptions,
  fishProfiles,
  formatInteger,
  formatNumber,
  setupOptions,
  standardFeedBagSizeKg,
  type CalculatorInputs,
  type CalculatorMode,
  type FishType,
} from "@/lib/calculator";
import { palette } from "@/theme";

type BannerTone = "neutral" | "success" | "warning" | "info";

const toneClasses: Record<BannerTone, { container: string; label: string; icon: string }> = {
  neutral: {
    container: "border-brand-line bg-white",
    label: "text-brand-subtext",
    icon: palette.subtext,
  },
  success: {
    container: "border-green-200 bg-green-50",
    label: "text-green-800",
    icon: "#166534",
  },
  warning: {
    container: "border-amber-200 bg-amber-50",
    label: "text-amber-900",
    icon: "#92400E",
  },
  info: {
    container: "border-sky-200 bg-sky-50",
    label: "text-sky-900",
    icon: "#0C4A6E",
  },
};

const getCalculatorIcon = (mode: CalculatorMode) => {
  switch (mode) {
    case "stock-density":
      return Fish;
    case "pond-size":
      return Ruler;
    default:
      return Calculator;
  }
};

const SelectorPill = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`rounded-full border px-4 py-3 ${active ? "border-primary bg-primary" : "border-brand-line bg-white"}`}
  >
    <AppText weight="semibold" className={active ? "text-white" : "text-brand-ink"}>
      {label}
    </AppText>
  </Pressable>
);

const ModeCard = ({
  mode,
  selected,
  onPress,
}: {
  mode: (typeof calculatorOptions)[number];
  selected: boolean;
  onPress: () => void;
}) => {
  const Icon = getCalculatorIcon(mode.value);

  return (
    <Pressable
      onPress={onPress}
      className={`mr-4 w-[292px] rounded-[28px] border p-5 ${selected ? "border-primary bg-primary" : "border-brand-line bg-white"}`}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className={`h-12 w-12 items-center justify-center rounded-full ${selected ? "bg-white/20" : "bg-secondary"}`}>
          <Icon color={selected ? "#FFFFFF" : palette.primary} size={22} />
        </View>
        <View className={`rounded-full px-3 py-1.5 ${selected ? "bg-white/20" : "bg-secondary"}`}>
          <AppText
            weight="semibold"
            className={`text-xs uppercase tracking-[1.1px] ${selected ? "text-white" : "text-primary"}`}
          >
            {selected ? "Selected" : "Tool"}
          </AppText>
        </View>
      </View>

      <AppText weight="bold" className={`mt-5 text-xl ${selected ? "text-white" : "text-brand-ink"}`}>
        {mode.label}
      </AppText>
      <AppText className={`mt-2 text-sm leading-6 ${selected ? "text-white/85" : "text-brand-subtext"}`}>
        {mode.description}
      </AppText>
      <AppText className={`mt-4 text-sm leading-6 ${selected ? "text-white/85" : "text-brand-subtext"}`}>
        {mode.bestFor}
      </AppText>
    </Pressable>
  );
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: typeof Fish;
  title: string;
  value: string;
  detail: string;
}) => (
  <Card className="w-[48.5%] gap-3 px-4 py-4">
    <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
      <Icon color={palette.primary} size={20} />
    </View>
    <View className="gap-1">
      <AppText className="text-sm text-brand-subtext">{title}</AppText>
      <AppText weight="bold" className="text-lg leading-6">
        {value}
      </AppText>
      <AppText className="text-xs leading-5 text-brand-subtext">{detail}</AppText>
    </View>
  </Card>
);

const StatusBanner = ({
  title,
  body,
  tone,
  aside,
}: {
  title: string;
  body: string;
  tone: BannerTone;
  aside?: string;
}) => {
  const styles = toneClasses[tone];

  return (
    <Card className={`gap-3 border ${styles.container}`}>
      <View className="flex-row items-start gap-3">
        <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-black/5">
          <AlertTriangle color={styles.icon} size={18} />
        </View>
        <View className="flex-1 gap-1">
          <AppText weight="bold" className={styles.label}>
            {title}
          </AppText>
          <AppText className={`text-sm leading-6 ${styles.label}`}>{body}</AppText>
          {aside ? <AppText className={`text-sm leading-6 ${styles.label}`}>{aside}</AppText> : null}
        </View>
      </View>
    </Card>
  );
};

const FeedCycleCard = ({
  stage,
  durationWeeks,
  feedSize,
  weightRangeGrams,
  dailyFeedKg,
  cycleFeedKg,
  cycleFeedBags,
}: {
  stage: string;
  durationWeeks: number;
  feedSize: string;
  weightRangeGrams: [number, number];
  dailyFeedKg: number;
  cycleFeedKg: number;
  cycleFeedBags: number;
}) => (
  <Card className="gap-4 px-4 py-4">
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <AppText weight="bold" className="text-lg">
          {stage}
        </AppText>
        <AppText className="mt-1 text-sm leading-6 text-brand-subtext">
          {weightRangeGrams[0]}g to {weightRangeGrams[1]}g, feed size {feedSize}
        </AppText>
      </View>
      <View className="rounded-full bg-secondary px-3 py-1.5">
        <AppText weight="semibold" className="text-xs uppercase tracking-[1px] text-primary">
          {durationWeeks} weeks
        </AppText>
      </View>
    </View>

    <View className="flex-row flex-wrap justify-between gap-3">
      <View className="w-[47%] rounded-2xl bg-secondary px-3 py-3">
        <AppText className="text-xs uppercase tracking-[1px] text-brand-subtext">Daily feed</AppText>
        <AppText weight="bold" className="mt-1 text-base">
          {formatNumber(dailyFeedKg)} kg
        </AppText>
      </View>
      <View className="w-[47%] rounded-2xl bg-secondary px-3 py-3">
        <AppText className="text-xs uppercase tracking-[1px] text-brand-subtext">Cycle total</AppText>
        <AppText weight="bold" className="mt-1 text-base">
          {formatNumber(cycleFeedKg)} kg
        </AppText>
      </View>
      <View className="w-[47%] rounded-2xl bg-secondary px-3 py-3">
        <AppText className="text-xs uppercase tracking-[1px] text-brand-subtext">Bag equivalent</AppText>
        <AppText weight="bold" className="mt-1 text-base">
          {formatNumber(cycleFeedBags)} bags
        </AppText>
      </View>
      <View className="w-[47%] rounded-2xl bg-secondary px-3 py-3">
        <AppText className="text-xs uppercase tracking-[1px] text-brand-subtext">Feed size</AppText>
        <AppText weight="bold" className="mt-1 text-base">
          {feedSize}
        </AppText>
      </View>
    </View>
  </Card>
);

export const CalculatorScreen = () => {
  const [calculatorMode, setCalculatorMode] = React.useState<CalculatorMode>(defaultCalculatorMode);
  const [calculationCount, setCalculationCount] = React.useState(0);
  const [formValues, setFormValues] = React.useState<CalculatorInputs>({
    ...defaultCalculatorInputs,
  });
  const [calculatedValues, setCalculatedValues] = React.useState<CalculatorInputs>({
    ...defaultCalculatorInputs,
  });

  const { setupType, fishType, numberOfFish, targetWeightGrams, length, width, depth } = formValues;
  const selectedCalculator = calculatorOptions.find((option) => option.value === calculatorMode) ?? calculatorOptions[0];
  const currentStockingGuide = React.useMemo(() => calculateGeometry(formValues).stockingGuide, [formValues]);
  const hasCalculated = calculationCount > 0;
  const hasPendingChanges = calculatorFieldsByMode[calculatorMode].some((field) => formValues[field] !== calculatedValues[field]);

  const geometry = React.useMemo(() => calculateGeometry(calculatedValues), [calculatedValues]);
  const feedPlanner = React.useMemo(
    () => calculateFeedPlanner(calculatedValues.fishType, geometry.fishCount),
    [calculatedValues.fishType, geometry.fishCount],
  );
  const stockDensity = React.useMemo(
    () => calculateStockDensity(calculatedValues.setupType, calculatedValues.fishType, geometry),
    [calculatedValues.fishType, calculatedValues.setupType, geometry],
  );
  const pondSize = React.useMemo(
    () => calculatePondSize(calculatedValues.setupType, calculatedValues.fishType, geometry),
    [calculatedValues.fishType, calculatedValues.setupType, geometry],
  );

  const calculationStatus = hasPendingChanges
    ? {
        tone: "warning" as const,
        label: "You have changed the form. Tap Calculate to refresh the results below.",
      }
    : {
        tone: "neutral" as const,
        label: "Results below match the latest values you calculated.",
      };

  const feedPlannerState =
    geometry.fishCount <= 0
      ? {
          tone: "neutral" as const,
          label: "Enter the number of fish you want to rear to estimate total feed and feed bags.",
          aside: undefined,
        }
      : {
          tone: "success" as const,
          label: "This estimate shows the total feed needed from starter to mature stage for the fish count you entered.",
          aside: `Recommended purchase: about ${formatInteger(feedPlanner.bagsToBuy)} bags of ${formatNumber(feedPlanner.bagSizeKg)} kg feed.`,
        };

  const stockDensityState =
    geometry.measurementBase <= 0
      ? {
          tone: "neutral" as const,
          label: "Enter valid pond or tank dimensions to estimate how many fingerlings you can stock.",
          aside: undefined,
        }
      : geometry.targetWeightKg <= 0
        ? {
            tone: "neutral" as const,
            label: "Enter a valid target harvest weight to adjust the stocking recommendation.",
            aside: undefined,
          }
        : stockDensity.adjustmentFactor < 0.95
          ? {
              tone: "warning" as const,
              label: "Because you want to grow the fish to a heavier market weight, the recommended stocking density is reduced.",
              aside: `Weight adjustment factor: ${formatNumber(stockDensity.adjustmentFactor)}x`,
            }
          : stockDensity.adjustmentFactor > 1.05
            ? {
                tone: "success" as const,
                label: "Because the target harvest weight is lighter, the system allows a higher stocking density than the base guide.",
                aside: `Weight adjustment factor: ${formatNumber(stockDensity.adjustmentFactor)}x`,
              }
            : {
                tone: "info" as const,
                label: "This target harvest weight is close to the standard density guide.",
                aside: `Weight adjustment factor: ${formatNumber(stockDensity.adjustmentFactor)}x`,
              };

  const pondSizeState =
    geometry.fishCount <= 0
      ? {
          tone: "neutral" as const,
          label: "Enter the number of fish you want to rear to estimate the pond or tank size you need.",
          aside: undefined,
        }
      : geometry.targetWeightKg <= 0
        ? {
            tone: "neutral" as const,
            label: "Enter a valid target harvest weight so the required size can be adjusted correctly.",
            aside: undefined,
          }
        : geometry.stockingGuide.unit === "m3" && geometry.depthValue <= 0
          ? {
              tone: "neutral" as const,
              label: "Enter a preferred water depth to calculate the footprint needed for the pond or tank.",
              aside: undefined,
            }
          : {
              tone: "success" as const,
              label: "The recommended size below is designed to hold your planned stock count at the selected harvest weight.",
              aside: geometry.fishCount > 0 && pondSize.adjustedDensity > 0
                ? `Planned density: ${formatNumber(pondSize.adjustedDensity)} ${geometry.stockingGuide.unit === "m2" ? "fish/m2" : "fish/m3"}`
                : undefined,
            };

  const updateFormValue = <Key extends keyof CalculatorInputs>(field: Key, value: CalculatorInputs[Key]) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleFishTypeChange = (value: FishType) => {
    setFormValues((current) => ({
      ...current,
      fishType: value,
      targetWeightGrams: fishProfiles[value].defaultTargetWeightGrams,
    }));
  };

  const handleCalculatorModeChange = (value: CalculatorMode) => {
    setCalculatorMode(value);
    setCalculationCount(0);
  };

  const handleCalculate = () => {
    setCalculatedValues({
      ...formValues,
    });
    setCalculationCount((current) => current + 1);
  };

  const handleReset = () => {
    setCalculatorMode(defaultCalculatorMode);
    setCalculationCount(0);
    setFormValues({
      ...defaultCalculatorInputs,
    });
    setCalculatedValues({
      ...defaultCalculatorInputs,
    });
  };

  return (
    <Screen contentContainerClassName="gap-6 pt-2">
      <SectionHeading
        eyebrow="Farm Calculator"
        title="Plan feed, stocking, and pond size"
        description="The mobile app now includes the same planning tools from the web app so farmers can estimate feed, density, and setup size on the go."
      />

      <Card className="gap-5 overflow-hidden p-0">
        <View className="bg-primary px-5 pb-5 pt-6">
          <AppText weight="bold" className="text-2xl text-white">
            Choose a planning tool
          </AppText>
          <AppText className="mt-2 text-sm leading-6 text-white/80">
            Start with the question you need answered first, then calculate from the same set of farm assumptions.
          </AppText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 pb-5">
          {calculatorOptions.map((option) => (
            <ModeCard
              key={option.value}
              mode={option}
              selected={option.value === calculatorMode}
              onPress={() => handleCalculatorModeChange(option.value)}
            />
          ))}
          <View className="w-1" />
        </ScrollView>
      </Card>

      <Card className="gap-5">
        <View className="gap-1">
          <AppText weight="bold" className="text-xl">
            {selectedCalculator.label}
          </AppText>
          <AppText className="text-sm leading-6 text-brand-subtext">{selectedCalculator.bestFor}</AppText>
        </View>

        {calculatorMode !== "feed-planner" ? (
          <View className="gap-3">
            <AppText weight="semibold" className="text-sm">
              Setup type
            </AppText>
            <View className="flex-row flex-wrap gap-3">
              {setupOptions.map((option) => (
                <SelectorPill
                  key={option.value}
                  label={option.label}
                  active={setupType === option.value}
                  onPress={() => updateFormValue("setupType", option.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View className="gap-3">
          <AppText weight="semibold" className="text-sm">
            Fish type
          </AppText>
          <View className="flex-row flex-wrap gap-3">
            {fishOptions.map((option) => (
              <SelectorPill
                key={option.value}
                label={option.label}
                active={fishType === option.value}
                onPress={() => handleFishTypeChange(option.value)}
              />
            ))}
          </View>
        </View>

        {calculatorMode === "feed-planner" ? (
          <TextField
            label="Number of fish"
            keyboardType="number-pad"
            value={numberOfFish}
            onChangeText={(value) => updateFormValue("numberOfFish", value)}
            placeholder="e.g. 250"
          />
        ) : null}

        {calculatorMode === "stock-density" ? (
          <>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <View className="w-[48.5%]">
                <TextField
                  label="Length (m)"
                  keyboardType="decimal-pad"
                  value={length}
                  onChangeText={(value) => updateFormValue("length", value)}
                  placeholder="Length"
                />
              </View>
              <View className="w-[48.5%]">
                <TextField
                  label="Width (m)"
                  keyboardType="decimal-pad"
                  value={width}
                  onChangeText={(value) => updateFormValue("width", value)}
                  placeholder="Width"
                />
              </View>
              <View className="w-[48.5%]">
                <TextField
                  label="Depth (m)"
                  keyboardType="decimal-pad"
                  value={depth}
                  onChangeText={(value) => updateFormValue("depth", value)}
                  placeholder="Depth"
                />
              </View>
              <View className="w-[48.5%]">
                <TextField
                  label="Target harvest weight (g)"
                  keyboardType="number-pad"
                  value={targetWeightGrams}
                  onChangeText={(value) => updateFormValue("targetWeightGrams", value)}
                  placeholder="e.g. 900"
                />
              </View>
            </View>
            <AppText className="text-sm leading-6 text-brand-subtext">{fishProfiles[fishType].targetHint}</AppText>
          </>
        ) : null}

        {calculatorMode === "pond-size" ? (
          <>
            <TextField
              label="Number of fish"
              keyboardType="number-pad"
              value={numberOfFish}
              onChangeText={(value) => updateFormValue("numberOfFish", value)}
              placeholder="e.g. 250"
            />
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <View className="w-[48.5%]">
                <TextField
                  label="Target harvest weight (g)"
                  keyboardType="number-pad"
                  value={targetWeightGrams}
                  onChangeText={(value) => updateFormValue("targetWeightGrams", value)}
                  placeholder="e.g. 900"
                />
              </View>
              <View className="w-[48.5%]">
                <TextField
                  label="Preferred water depth (m)"
                  keyboardType="decimal-pad"
                  value={depth}
                  onChangeText={(value) => updateFormValue("depth", value)}
                  placeholder="e.g. 1.2"
                />
              </View>
            </View>
            <AppText className="text-sm leading-6 text-brand-subtext">{fishProfiles[fishType].targetHint}</AppText>
          </>
        ) : null}

        <Card className="gap-2 bg-secondary">
          {calculatorMode === "feed-planner" ? (
            <>
              <AppText weight="semibold" className="text-sm text-primary">
                Feed bag basis
              </AppText>
              <AppText className="text-sm leading-6 text-brand-subtext">
                Feed bag estimates are based on {formatNumber(standardFeedBagSizeKg)} kg per standard bag.
              </AppText>
            </>
          ) : (
            <>
              <AppText weight="semibold" className="text-sm text-primary">
                Density guide
              </AppText>
              <AppText className="text-sm leading-6 text-brand-subtext">
                {currentStockingGuide.notes} Base density for {fishType} in this setup is{" "}
                {formatNumber(currentStockingGuide.densityByFish[fishType])} {currentStockingGuide.densityLabel}.
              </AppText>
            </>
          )}
        </Card>

        {hasCalculated ? (
          <StatusBanner title="Calculation status" body={calculationStatus.label} tone={calculationStatus.tone} />
        ) : null}

        <View className="flex-row gap-3">
          <Button className="flex-1" onPress={handleCalculate}>
            Calculate
          </Button>
          <Button variant="outline" className="flex-1" onPress={handleReset}>
            <View className="flex-row items-center justify-center gap-2">
              <RefreshCcw color={palette.ink} size={18} />
              <AppText weight="semibold" className="text-brand-ink">
                Reset
              </AppText>
            </View>
          </Button>
        </View>
      </Card>

      {hasCalculated && calculatorMode === "feed-planner" ? (
        <View className="gap-4">
          <View className="flex-row flex-wrap justify-between gap-y-4">
            <StatCard
              icon={Scale}
              title="Total feed"
              value={`${formatNumber(feedPlanner.totalProgramFeedKg)} kg`}
              detail="Estimated feed from starter through mature stage."
            />
            <StatCard
              icon={Calculator}
              title="Bags to buy"
              value={`${formatInteger(feedPlanner.bagsToBuy)} bags`}
              detail="Rounded purchase estimate using standard feed bags."
            />
            <StatCard
              icon={Droplets}
              title="Peak daily feed"
              value={`${formatNumber(feedPlanner.peakDailyFeedKg)} kg`}
              detail="Highest daily feed load across the program."
            />
            <StatCard
              icon={Fish}
              title="Fish planned"
              value={`${formatInteger(geometry.fishCount)} fish`}
              detail="The stocking count used for this feed estimate."
            />
          </View>

          <StatusBanner
            title="Feed planning guidance"
            body={feedPlannerState.label}
            aside={feedPlannerState.aside}
            tone={feedPlannerState.tone}
          />

          <Card className="gap-3 bg-secondary">
            <AppText weight="bold" className="text-lg">
              Planning notes
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              Feed is estimated from average body weight in each growth cycle and the full number of fish entered above.
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              Actual feed use can change with water quality, temperature, survival rate, and how aggressively the fish are feeding.
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              This section works best when you know the number of fish you want to rear and need to estimate the feed purchase volume.
            </AppText>
          </Card>

          <View className="gap-3">
            <AppText weight="bold" className="text-xl">
              Feed schedule by growth cycle
            </AppText>
            {feedPlanner.feedRows.map((cycle) => (
              <FeedCycleCard key={cycle.stage} {...cycle} />
            ))}
          </View>
        </View>
      ) : null}

      {hasCalculated && calculatorMode === "stock-density" ? (
        <View className="gap-4">
          <View className="flex-row flex-wrap justify-between gap-y-4">
            <StatCard
              icon={Fish}
              title="Recommended fingerlings"
              value={`${formatInteger(stockDensity.recommendedFingerlings)} fish`}
              detail="Estimated optimal stocking quantity for this setup."
            />
            <StatCard
              icon={Scale}
              title="Adjusted density"
              value={`${formatNumber(stockDensity.adjustedDensity)} ${geometry.stockingGuide.unit === "m2" ? "fish/m2" : "fish/m3"}`}
              detail="Adjusted from the base guide using the harvest weight."
            />
            <StatCard
              icon={Droplets}
              title={geometry.measurementLabel}
              value={`${formatNumber(geometry.measurementBase)} ${geometry.measurementUnit}`}
              detail="The usable size basis behind the stocking estimate."
            />
            <StatCard
              icon={Calculator}
              title="Projected harvest biomass"
              value={`${formatNumber(stockDensity.projectedHarvestBiomassKg)} kg`}
              detail="Estimated live weight at the selected harvest target."
            />
          </View>

          <StatusBanner
            title="Density guidance"
            body={stockDensityState.label}
            aside={stockDensityState.aside}
            tone={stockDensityState.tone}
          />

          <Card className="gap-3 bg-secondary">
            <AppText weight="bold" className="text-lg">
              How this section works
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              The stock density calculator estimates the total number of fingerlings your pond or tank can hold for good performance.
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              It uses pond dimensions together with the weight you intend to grow the fish to, so heavier harvest targets reduce the recommended stocking quantity.
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              Use this section when you know the pond size already and want to decide how many fish to stock.
            </AppText>
          </Card>
        </View>
      ) : null}

      {hasCalculated && calculatorMode === "pond-size" ? (
        <View className="gap-4">
          <View className="flex-row flex-wrap justify-between gap-y-4">
            <StatCard
              icon={Ruler}
              title="Required size basis"
              value={`${formatNumber(pondSize.requiredMeasurementBase)} ${geometry.stockingGuide.unit}`}
              detail={
                geometry.stockingGuide.unit === "m2"
                  ? "This is the surface area needed for the planned stock."
                  : "This is the water volume needed for the planned stock."
              }
            />
            <StatCard
              icon={Droplets}
              title="Required water volume"
              value={`${formatNumber(pondSize.requiredWaterVolume)} m3`}
              detail="Useful when planning tank or concrete pond water capacity."
            />
            <StatCard
              icon={Scale}
              title="Required surface area"
              value={`${formatNumber(pondSize.requiredSurfaceArea)} m2`}
              detail="Used to estimate the footprint of the pond or tank."
            />
            <StatCard
              icon={Calculator}
              title="Projected harvest biomass"
              value={`${formatNumber(pondSize.projectedHarvestBiomassKg)} kg`}
              detail="Estimated total live weight for the target stock plan."
            />
          </View>

          <StatusBanner
            title="Pond size guidance"
            body={pondSizeState.label}
            aside={pondSizeState.aside}
            tone={pondSizeState.tone}
          />

          <TankSizePreview
            setupType={calculatedValues.setupType}
            length={pondSize.suggestedLength}
            width={pondSize.suggestedWidth}
            depth={geometry.depthValue}
          />

          <Card className="gap-3 bg-secondary">
            <AppText weight="bold" className="text-lg">
              Suggested footprint
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              Example 2:1 footprint at the entered depth: about {formatNumber(pondSize.suggestedLength)} m long by{" "}
              {formatNumber(pondSize.suggestedWidth)} m wide.
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              For earthen ponds, surface area drives the recommendation most strongly. For tanks and concrete ponds, water volume and depth matter more.
            </AppText>
            <AppText className="text-sm leading-6 text-brand-subtext">
              Use this section when you know the number of fish you want to rear and want to size the pond or tank before building.
            </AppText>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
};
