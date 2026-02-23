import { apiRequest } from "./api";

export const getFeed = async (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const path = search ? `/posts?${search}` : "/posts";
  return apiRequest(path);
};

export const createPost = async ({ text, tags = [], image = null }) => {
  return apiRequest("/posts", {
    method: "POST",
    body: { text, tags, image },
  });
};

export const addComment = async ({ postId, comment }) => {
  return apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: { comment },
  });
};

export const reactToPost = async ({ postId, reaction }) => {
  return apiRequest(`/posts/${postId}/reactions`, {
    method: "POST",
    body: { reaction },
  });
};

export default {
  getFeed,
  createPost,
  addComment,
  reactToPost,
};
