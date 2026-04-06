function toFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : null;
}

function toIsoString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function paisaToNpr(value) {
  const paisa = toFiniteNumber(value);
  if (paisa === null) return null;
  return paisa / 100;
}

export function serializeDonation(donationDoc) {
  return {
    id: String(donationDoc?._id || ""),
    provider: donationDoc?.provider || "khalti",
    status: donationDoc?.status || "Initiated",
    userId: donationDoc?.userId ? String(donationDoc.userId) : "",
    userEmail: donationDoc?.userEmail || "",
    userNickname: donationDoc?.userNickname || "",
    userUsername: donationDoc?.userUsername || "",
    donorName: donationDoc?.donorName || "",
    amount: toFiniteNumber(donationDoc?.amount) ?? 0,
    currency: donationDoc?.currency || "NPR",
    purchaseOrderId: donationDoc?.purchaseOrderId || "",
    purchaseOrderName: donationDoc?.purchaseOrderName || "",
    pidx: donationDoc?.pidx || "",
    transactionId: donationDoc?.transactionId || "",
    totalAmount: toFiniteNumber(donationDoc?.totalAmount),
    fee: toFiniteNumber(donationDoc?.fee),
    refunded: Boolean(donationDoc?.refunded),
    demo: Boolean(donationDoc?.demo),
    createdAt: toIsoString(donationDoc?.createdAt) || new Date().toISOString(),
    updatedAt: toIsoString(donationDoc?.updatedAt) || new Date().toISOString(),
  };
}
