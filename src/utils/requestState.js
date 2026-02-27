export const formatRequestError = (
  error,
  fallbackMessage = "Something went wrong. Please try again."
) => {
  if (!error) return fallbackMessage;

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error?.message && String(error.message).trim()) {
    return String(error.message);
  }

  return fallbackMessage;
};

export default {
  formatRequestError,
};
