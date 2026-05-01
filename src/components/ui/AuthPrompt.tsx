import { useNavigation } from "@react-navigation/native";
import { LogIn, UserPlus } from "lucide-react-native";
import { View } from "react-native";
import { palette } from "@/theme";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

export const AuthPrompt = ({
  title = "Sign in to continue",
  description = "This part of the app uses your account and live data from the backend.",
}: {
  title?: string;
  description?: string;
}) => {
  const navigation = useNavigation<any>();

  return (
    <EmptyState
      icon={LogIn}
      title={title}
      description={description}
      action={
        <View className="mt-2 w-full gap-3">
          <Button onPress={() => navigation.navigate("Login")}>
            <View className="flex-row items-center gap-2">
              <LogIn color="#FFFFFF" size={18} />
              <AppText weight="semibold" className="text-white">
                Sign in
              </AppText>
            </View>
          </Button>
          <Button
            variant="outline"
            onPress={() => navigation.navigate("Register")}
          >
            <View className="flex-row items-center gap-2">
              <UserPlus color={palette.primary} size={18} />
              <AppText weight="semibold" className="text-primary">
                Create account
              </AppText>
            </View>
          </Button>
        </View>
      }
    />
  );
};
