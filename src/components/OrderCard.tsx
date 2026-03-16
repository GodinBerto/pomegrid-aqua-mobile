import { Pressable, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Order } from "@/types/domain";
import { AppText, Badge, Card } from "@/components/ui";
import { formatPaymentMethodLabel } from "@/lib/payment";
import { palette } from "@/theme";

export const OrderCard = ({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) => (
  <Card className="gap-4">
    <Pressable onPress={onToggle} className="flex-row items-center justify-between">
      <View className="flex-1 gap-1">
        <AppText weight="bold" className="text-lg">
          Order #{order.id}
        </AppText>
        <AppText className="text-sm text-brand-subtext">{formatDateTime(order.created_at)}</AppText>
      </View>
      <View className="flex-row items-center gap-3">
        <Badge
          label={order.status}
          tone={String(order.status).toLowerCase() === "delivered" ? "success" : "warning"}
        />
        {expanded ? <ChevronUp color={palette.subtext} /> : <ChevronDown color={palette.subtext} />}
      </View>
    </Pressable>
    <View className="flex-row items-center justify-between">
      <View>
        <AppText className="text-xs uppercase tracking-[1.2px] text-brand-subtext">Total</AppText>
        <AppText weight="bold" className="text-xl text-primary">
          {formatCurrency(order.total_price)}
        </AppText>
      </View>
      <View>
        <AppText className="text-xs uppercase tracking-[1.2px] text-brand-subtext">Payment</AppText>
        <AppText weight="semibold" className="text-sm">
          {formatPaymentMethodLabel(order.payment_method)}
        </AppText>
      </View>
    </View>
    {expanded ? (
      <View className="gap-3 border-t border-brand-line pt-4">
        {order.items.map((item) => (
          <View key={`${order.id}-${item.id}`} className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <AppText weight="semibold">{item.name}</AppText>
              <AppText className="text-sm text-brand-subtext">Qty {item.quantity}</AppText>
            </View>
            <AppText weight="semibold">{formatCurrency(item.unit_price * item.quantity)}</AppText>
          </View>
        ))}
        {order.shipping_address ? (
          <View className="gap-1 rounded-2xl bg-secondary p-3">
            <AppText weight="semibold" className="text-sm">
              Shipping address
            </AppText>
            <AppText className="text-sm text-brand-subtext">{order.shipping_address}</AppText>
          </View>
        ) : null}
        {order.notes ? (
          <View className="gap-1 rounded-2xl bg-secondary p-3">
            <AppText weight="semibold" className="text-sm">
              Notes
            </AppText>
            <AppText className="text-sm text-brand-subtext">{order.notes}</AppText>
          </View>
        ) : null}
      </View>
    ) : null}
  </Card>
);
