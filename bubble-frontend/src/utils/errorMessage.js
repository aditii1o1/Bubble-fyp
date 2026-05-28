function cleanMessage(value) {
  return String(value || "").trim();
}

function isGenericHttpErrorMessage(message) {
  return /^Request failed with status code \d{3}$/i.test(message);
}

export function isTimeoutError(error) {
  const code = cleanMessage(error?.code).toUpperCase();
  const message = cleanMessage(error?.message).toLowerCase();
  return (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    message.includes("timeout")
  );
}

export function isNetworkLikeError(error) {
  const code = cleanMessage(error?.code).toUpperCase();
  const message = cleanMessage(error?.message).toLowerCase();
  return (
    code === "ERR_NETWORK" ||
    message === "network error" ||
    message.includes("network request failed") ||
    (!error?.response && Boolean(error?.request))
  );
}

export function getErrorMessage(error, options = {}) {
  const fallbackMessage =
    cleanMessage(options.fallbackMessage) ||
    "Something went wrong. Please try again.";
  const networkMessage =
    cleanMessage(options.networkMessage) ||
    "Can't reach the server. Check your connection and make sure the Bubble API is available.";
  const timeoutMessage =
    cleanMessage(options.timeoutMessage) ||
    "The request took too long. Please try again.";
  const unauthorizedMessage =
    cleanMessage(options.unauthorizedMessage) ||
    "Your session expired. Please sign in again.";
  const forbiddenMessage =
    cleanMessage(options.forbiddenMessage) ||
    "You don't have permission to do that.";
  const serverMessage =
    cleanMessage(options.serverMessage) ||
    "The server ran into a problem. Please try again in a moment.";

  if (typeof error === "string") {
    return cleanMessage(error) || fallbackMessage;
  }

  const backendMessage = cleanMessage(error?.response?.data?.message);
  if (backendMessage) return backendMessage;

  const status = Number(error?.status || error?.response?.status || 0);
  if (isTimeoutError(error)) return timeoutMessage;
  if (isNetworkLikeError(error)) return networkMessage;

  if (status === 401) return unauthorizedMessage;
  if (status === 403) return forbiddenMessage;
  if (status >= 500) return serverMessage;

  const rawMessage = cleanMessage(error?.message);
  if (rawMessage && !isGenericHttpErrorMessage(rawMessage)) {
    return rawMessage;
  }

  return fallbackMessage;
}

export function toAppError(error, options = {}) {
  if (error?.isAppError) return error;

  const message = getErrorMessage(error, options);
  const appError = new Error(message);
  appError.name = "AppError";
  appError.isAppError = true;
  appError.status = Number(error?.status || error?.response?.status || 0) || undefined;
  appError.code = error?.code;
  appError.response = error?.response;
  appError.request = error?.request;
  appError.config = error?.config;
  appError.isAxiosError = Boolean(error?.isAxiosError);
  appError.isNetworkError = isNetworkLikeError(error);
  appError.isTimeoutError = isTimeoutError(error);
  appError.originalError = error?.originalError || error;
  if (error?.stack) appError.stack = error.stack;
  return appError;
}
