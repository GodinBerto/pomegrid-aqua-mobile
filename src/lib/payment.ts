export const formatPaymentMethodLabel = (value?: string | null) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (!normalized) return "Not selected";
  if (normalized.includes("card")) return "Credit / Debit Card";
  if (normalized.includes("mobile")) return "Mobile Money";
  if (normalized.includes("cod") || normalized.includes("cash") || normalized.includes("physical")) {
    return "Physical Payment";
  }

  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const isPhysicalPaymentMethod = (value?: string | null) => {
  const normalized = String(value || "").toLowerCase();
  return normalized === "cod" || normalized.includes("cash") || normalized.includes("physical");
};

export const isSuccessfulGatewayPayment = (status?: string | null) => {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  return ["success", "paid", "completed"].includes(normalizedStatus);
};
