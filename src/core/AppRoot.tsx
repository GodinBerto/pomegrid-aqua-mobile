import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useFonts } from "expo-font";
import * as Network from "expo-network";
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
import { palette } from "@/theme";

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 2,
      retry: (failureCount, error) => {
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("failed to reach api") || message.includes("session expired")) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "pomegrid-react-query-cache",
});

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (state) => {
    handleFocus(state === "active");
  });

  return () => subscription.remove();
});

onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    setOnline(Boolean(state.isConnected ?? state.isInternetReachable));
  });

  return () => subscription.remove();
});

export const AppRoot = () => {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  void SystemUI.setBackgroundColorAsync(palette.canvas);

  if (!fontsLoaded) {
    return <FullScreenLoader label="Loading your storefront..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            maxAge: 1000 * 60 * 60 * 24,
          }}
        >
          <AuthBootstrap>
            <AppNavigator />
          </AuthBootstrap>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
