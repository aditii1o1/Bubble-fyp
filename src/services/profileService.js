import { apiRequest } from "./api";

export const getMyProfile = async () => {
  return apiRequest("/profile/me");
};

export const getMyPosts = async () => {
  return apiRequest("/profile/me/posts");
};

export const getMyReposts = async () => {
  return apiRequest("/profile/me/reposts");
};

export const updateMyAvatar = async ({ avatar }) => {
  return apiRequest("/profile/me/avatar", {
    method: "PATCH",
    body: { avatar },
  });
};

export const deleteMyPost = async ({ postId }) => {
  return apiRequest(`/posts/${postId}`, {
    method: "DELETE",
  });
};

export const deleteMyRepost = async ({ repostId }) => {
  return apiRequest(`/reposts/${repostId}`, {
    method: "DELETE",
  });
};

export default {
  getMyProfile,
  getMyPosts,
  getMyReposts,
  updateMyAvatar,
  deleteMyPost,
  deleteMyRepost,
};
