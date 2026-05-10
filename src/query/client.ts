import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import * as Network from "expo-network";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 2,
      retry: (failureCount, error) => {
        const message =
          error instanceof Error ? error.message.toLowerCase() : "";

        if (
          message.includes("failed to reach api") ||
          message.includes("session expired")
        ) {
          return false;
        }

        return failureCount < 1;
      },
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "pomegrid-react-query-cache",
});

let lifecycleInitialized = false;

export const initializeQueryClientLifecycle = () => {
  if (lifecycleInitialized) return;

  lifecycleInitialized = true;

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
};

export const persistedQueryClientOptions = {
  persister: queryPersister,
  maxAge: 1000 * 60 * 60 * 24,
};
