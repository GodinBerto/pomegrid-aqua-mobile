import { View } from "react-native";
import { AppText } from "@/components/ui";

export const CheckoutStepper = ({
  step,
}: {
  step: "cart" | "details" | "payment";
}) => {
  const steps: Array<"cart" | "details" | "payment"> = ["cart", "details", "payment"];
  const activeIndex = steps.indexOf(step);

  return (
    <View className="mb-6 flex-row items-center gap-3">
      {steps.map((item, index) => {
        const isActive = index === activeIndex;
        const isCompleted = index < activeIndex;

        return (
          <View key={item} className="flex-1 flex-row items-center gap-3">
            <View
              className={`h-9 w-9 items-center justify-center rounded-full ${
                isActive || isCompleted ? "bg-primary" : "bg-secondary"
              }`}
            >
              <AppText weight="bold" className={isActive || isCompleted ? "text-white" : "text-primary"}>
                {index + 1}
              </AppText>
            </View>
            <AppText
              weight={isActive ? "bold" : "semibold"}
              className={isActive ? "text-primary" : "text-brand-subtext"}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </AppText>
            {index < steps.length - 1 ? <View className="h-px flex-1 bg-brand-line" /> : null}
          </View>
        );
      })}
    </View>
  );
};
