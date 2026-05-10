import React from "react";
import { Alert, View } from "react-native";
import { Eye, EyeOff, LogIn } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import {
  AppText,
  Button,
  Card,
  Screen,
  SectionHeading,
  TextField,
} from "@/components/ui";
import { useLoginMutation } from "@/query";
import { palette } from "@/theme";

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing details", "Enter both your email and password.");
      return;
    }

    const response = await loginMutation.mutateAsync({ email, password });

    if (!response.success || !response.data) {
      Alert.alert("Sign in failed", response.message || "Please try again.");
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Tabs");
  };

  return (
    <Screen
      showAppHeader={false}
      contentContainerClassName="justify-center flex-grow py-8"
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
        <Button onPress={handleLogin} disabled={loginMutation.isPending}>
          <View className="flex-row items-center gap-2">
            <LogIn color="#FFFFFF" size={18} />
            <AppText weight="semibold" className="text-white">
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
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
