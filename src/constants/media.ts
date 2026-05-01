import type { ImageSourcePropType } from "react-native";
import type { Product } from "@/types/domain";
import { getPrimaryProductImage, normalizeCategoryName } from "@/lib/utils";
import { palette } from "@/theme";

export const marketingImages = {
  catfish: require("../../assets/marketing/catfishbg.webp"),
  tilapia: require("../../assets/marketing/tilapiabg.jpg"),
  livestock: require("../../assets/marketing/live-stock-bg.jpg"),
  fruits: require("../../assets/marketing/fruits.jpg"),
  vegetables: require("../../assets/marketing/vegitables-fruits-bg.jpg"),
  equipment: require("../../assets/marketing/waterpump.webp"),
  calculator: require("../../assets/marketing/calculator-bg.png"),
};

export const categoryImageMap: Record<string, ImageSourcePropType> = {
  Fish: marketingImages.catfish,
  "Live Stock": marketingImages.livestock,
  Vegetables: marketingImages.tilapia,
  Fruits: marketingImages.tilapia,
  "Farm Equipment": marketingImages.equipment,
  Calculator: marketingImages.calculator,
};

const categoryArtMap = {
  Fish: {
    label: "Fish",
    code: "AQ",
    colors: [palette.primaryDark, palette.primary] as [string, string],
  },
  "Live Stock": {
    label: "Live Stock",
    code: "LS",
    colors: ["#3E2723", "#795548"] as [string, string],
  },
  Vegetables: {
    label: "Vegetables",
    code: "VG",
    colors: ["#2E7D32", "#66BB6A"] as [string, string],
  },
  Fruits: {
    label: "Fruits",
    code: "FR",
    colors: ["#C62828", "#EF6C00"] as [string, string],
  },
  "Farm Equipment": {
    label: "Farm Equipment",
    code: "EQ",
    colors: ["#37474F", "#607D8B"] as [string, string],
  },
} as const;

export const getCategoryArt = (category?: string) =>
  categoryArtMap[normalizeCategoryName(category) || "Fish"] ||
  categoryArtMap.Fish;

export const getProductImageSource = (product?: Partial<Product>) =>
  getPrimaryProductImage(product);
