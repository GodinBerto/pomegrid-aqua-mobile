import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import { getProductImageSource } from "@/constants/media";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/domain";
import { AppText, Badge, Button, Card } from "@/components/ui";
import { palette } from "@/theme";

export const ProductCard = ({
  product,
  onPress,
  onAddToCart,
}: {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}) => (
  <Pressable onPress={onPress} className="flex-1">
    <Card className="p-0 overflow-hidden">
      <Image
        source={getProductImageSource(product)}
        style={{ width: "100%", height: 160 }}
        contentFit="cover"
      />
      <View className="gap-3 p-4">
        <View className="flex-row items-center justify-between">
          <Badge label={product.category} />
          <View className="flex-row items-center gap-1">
            <Star size={14} color={palette.warning} fill={palette.warning} />
            <AppText weight="semibold" className="text-xs text-brand-subtext">
              {(product.rating || 4.5).toFixed(1)}
            </AppText>
          </View>
        </View>
        <View className="gap-1">
          <AppText weight="bold" numberOfLines={2} className="text-lg leading-6">
            {product.title}
          </AppText>
          <AppText numberOfLines={2} className="text-sm leading-5 text-brand-subtext">
            {product.description}
          </AppText>
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <AppText weight="bold" className="text-lg text-primary">
              {formatCurrency(product.price)}
            </AppText>
            <AppText className="text-xs text-brand-subtext">{product.weight_per_unit}</AppText>
          </View>
          {onAddToCart ? (
            <Button size="sm" onPress={onAddToCart}>
              Add
            </Button>
          ) : null}
        </View>
      </View>
    </Card>
  </Pressable>
);
