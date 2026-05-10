import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import * as SystemUI from "expo-system-ui";
import * as WebBrowser from "expo-web-browser";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { FullScreenLoader } from "@/components/ui";
import { AuthBootstrap } from "@/core/AuthBootstrap";
import { AppNavigator } from "@/navigation/AppNavigator";
import {
  initializeQueryClientLifecycle,
  persistedQueryClientOptions,
  queryClient,
} from "@/query";
import { palette } from "@/theme";

WebBrowser.maybeCompleteAuthSession();

export const AppRoot = () => {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  void SystemUI.setBackgroundColorAsync(palette.canvas);
  initializeQueryClientLifecycle();

  if (!fontsLoaded) {
    return <FullScreenLoader label="Loading your storefront..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistedQueryClientOptions}
        >
          <AuthBootstrap>
            <AppNavigator />
          </AuthBootstrap>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
