export function getAuthenticatedHref({ role, onboarded } = {}) {
  if (onboarded === false) return "/(onboarding)/setup";
  if (role === "admin") return "/(admin)";
  return "/(tabs)/Home";
}
