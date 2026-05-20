import { getErrorMessage } from "./errorMessage";

export function getAuthErrorMessage(error) {
  return getErrorMessage(error, {
    fallbackMessage: "Something went wrong. Please try again.",
  });
}

