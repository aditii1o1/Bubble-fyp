import { apiRequest } from "./api";

export const repostPost = async ({ postId, overlayText = "" }) => {
  return apiRequest(`/posts/${postId}/repost`, {
    method: "POST",
    body: { overlayText },
  });
};

export const reportContent = async ({
  targetType = "post",
  targetId = null,
  reason,
  additionalInfo = "",
}) => {
  const path =
    targetId && targetType
      ? `/reports/${targetType}/${targetId}`
      : "/reports";

  return apiRequest(path, {
    method: "POST",
    body: {
      targetType,
      targetId,
      reason,
      additionalInfo,
    },
  });
};

export default {
  repostPost,
  reportContent,
};
