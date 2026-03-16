import type { ImageSourcePropType } from "react-native";
import type { Product } from "@/types/domain";
import { getPrimaryProductImage, normalizeCategoryName } from "@/lib/utils";

export const marketingImages = {
  catfish: require("../../assets/marketing/catfishbg.webp"),
  tilapia: require("../../assets/marketing/tilapiabg.jpg"),
  livestock: require("../../assets/marketing/live-stock-bg.jpg"),
  fruits: require("../../assets/marketing/fruits.jpg"),
  vegetables: require("../../assets/marketing/vegitables-fruits-bg.jpg"),
  equipment: require("../../assets/marketing/waterpump.webp"),
};

export const categoryImageMap: Record<string, ImageSourcePropType> = {
  Fish: marketingImages.catfish,
  "Live Stock": marketingImages.livestock,
  Vegetables: marketingImages.vegetables,
  Fruits: marketingImages.fruits,
  "Farm Equipment": marketingImages.equipment,
};

export const getProductImageSource = (product?: Partial<Product>): ImageSourcePropType | string => {
  const remoteImage = getPrimaryProductImage(product);
  if (remoteImage) return remoteImage;

  return categoryImageMap[normalizeCategoryName(product?.category) || "Fish"] || marketingImages.catfish;
};
