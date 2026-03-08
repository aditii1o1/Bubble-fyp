export function getAuthErrorMessage(error) {
  const message =
    String(error?.response?.data?.message || "") ||
    String(error?.message || "") ||
    "Something went wrong. Please try again.";

  return message;
}

