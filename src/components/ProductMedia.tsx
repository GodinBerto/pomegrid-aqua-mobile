import { View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/ui";
import { getCategoryArt, getProductImageSource } from "@/constants/media";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

export const ProductMedia = ({
  product,
  height,
  compact = false,
}: {
  product?: Partial<Product>;
  height: number;
  compact?: boolean;
}) => {
  const imageSource = getProductImageSource(product);

  if (imageSource) {
    return (
      <Image
        source={imageSource}
        style={{ width: "100%", height }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={180}
        recyclingKey={`product-media-${String(product?.id || product?.title || product?.category || "fallback")}`}
      />
    );
  }

  const categoryArt = getCategoryArt(product?.category);

  return (
    <LinearGradient colors={categoryArt.colors} style={{ width: "100%", height, justifyContent: "space-between", padding: 16 }}>
      <View className="self-start rounded-full bg-black/10 px-3 py-1.5">
        <AppText weight="semibold" className="text-xs uppercase tracking-[1.2px] text-white/90">
          {categoryArt.code}
        </AppText>
      </View>
      <View className="gap-2">
        <AppText
          weight="bold"
          numberOfLines={compact ? 2 : 3}
          className={cn(compact ? "text-2xl leading-7" : "text-3xl leading-9", "text-white")}
        >
          {product?.title || categoryArt.label}
        </AppText>
        {product?.description ? (
          <AppText numberOfLines={compact ? 2 : 3} className="text-sm leading-5 text-white/85">
            {product.description}
          </AppText>
        ) : null}
      </View>
    </LinearGradient>
  );
};
