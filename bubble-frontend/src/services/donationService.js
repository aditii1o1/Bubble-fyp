import { api } from "./apiClient";

export const donationService = {
  initiate: async ({ amount, name, email }) => {
    const res = await api.post("/donate/initiate", {
      amount,
      name,
      email,
    });
    return res.data || null;
  },

  verify: async ({ pidx }) => {
    const res = await api.post("/donate/verify", { pidx });
    return res.data || null;
  },
};
