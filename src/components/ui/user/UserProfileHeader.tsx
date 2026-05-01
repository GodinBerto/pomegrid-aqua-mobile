import { User } from "lucide-react-native";
import { Image, View } from "react-native";
import { HeaderIconButton } from "../header/HeaderIconButton";

export const UserProfileHeader = ({
  avatarUrl,
  onPress,
}: {
  avatarUrl?: string;
  onPress?: () => void;
}) => (
  <View className="flex-row items-center gap-3">
    <View className="h-12 w-12 overflow-hidden rounded-full bg-secondary">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <HeaderIconButton
          icon={User}
          accessibilityLabel="User profile"
          onPress={onPress}
        />
      )}
    </View>
  </View>
);
