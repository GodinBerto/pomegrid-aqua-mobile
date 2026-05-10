import React from "react";
import { Alert, View } from "react-native";
import { Eye, EyeOff, LogIn } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { loginUser } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import {
  AppText,
  Button,
  Card,
  Screen,
  SectionHeading,
  TextField,
} from "@/components/ui";
import { palette } from "@/theme";

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing details", "Enter both your email and password.");
      return;
    }

    setIsSubmitting(true);
    const response = await loginUser({ email, password });
    setIsSubmitting(false);

    if (!response.success || !response.data) {
      Alert.alert("Sign in failed", response.message || "Please try again.");
      return;
    }

    setUser(response.data);
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Tabs");
  };

  return (
    <Screen
      contentContainerClassName="justify-center flex-grow py-8"
      headerClassName=""
    >
      <Card className="gap-5">
        <SectionHeading
          eyebrow="Welcome back"
          title="Sign in to your account"
          description="Protected areas like cart, account, checkout, and live chat use the same user API as the web app."
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View className="gap-2">
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Button
            variant="ghost"
            size="sm"
            className="self-end px-0"
            onPress={() => setShowPassword((value) => !value)}
          >
            <View className="flex-row items-center gap-2">
              {showPassword ? (
                <EyeOff color={palette.primary} size={16} />
              ) : (
                <Eye color={palette.primary} size={16} />
              )}
              <AppText weight="semibold" className="text-primary">
                {showPassword ? "Hide password" : "Show password"}
              </AppText>
            </View>
          </Button>
        </View>
        <Button onPress={handleLogin} disabled={isSubmitting}>
          <View className="flex-row items-center gap-2">
            <LogIn color="#FFFFFF" size={18} />
            <AppText weight="semibold" className="text-white">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </AppText>
          </View>
        </Button>
        <Button
          variant="outline"
          onPress={() => navigation.navigate("Register")}
        >
          Create a new account
        </Button>
      </Card>
    </Screen>
  );
};
