const pendingSignups = new Map();

function createPendingKey() {
  return `signup_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const pendingSignupService = {
  save(data = {}) {
    const key = createPendingKey();
    pendingSignups.set(key, { ...data });
    return key;
  },

  get(key) {
    if (!key) return null;
    const value = pendingSignups.get(String(key));
    return value ? { ...value } : null;
  },

  clear(key) {
    if (!key) return;
    pendingSignups.delete(String(key));
  },
};
