export function getReportReasonLabel(reason) {
  switch (reason) {
    case "spam":
      return "Spam";
    case "harassment":
      return "Harassment";
    case "inappropriate":
      return "Inappropriate";
    case "other":
      return "Other";
    default:
      return String(reason || "Unknown");
  }
}

