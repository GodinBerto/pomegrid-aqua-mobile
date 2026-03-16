import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CheckoutFormData, PendingOnlinePayment } from "@/types/domain";

export const defaultCheckoutForm: CheckoutFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  shippingMethod: "",
  paymentMethod: "",
};

type CheckoutState = {
  form: CheckoutFormData;
  pendingOnlinePayment: PendingOnlinePayment | null;
  updateForm: (updates: Partial<CheckoutFormData>) => void;
  setPendingOnlinePayment: (payment: PendingOnlinePayment | null) => void;
  resetCheckout: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      form: defaultCheckoutForm,
      pendingOnlinePayment: null,
      updateForm: (updates) =>
        set((state) => ({
          form: {
            ...state.form,
            ...updates,
          },
        })),
      setPendingOnlinePayment: (pendingOnlinePayment) => set({ pendingOnlinePayment }),
      resetCheckout: () =>
        set({
          form: defaultCheckoutForm,
          pendingOnlinePayment: null,
        }),
    }),
    {
      name: "pomegrid-checkout-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        form: state.form,
        pendingOnlinePayment: state.pendingOnlinePayment,
      }),
    },
  ),
);
