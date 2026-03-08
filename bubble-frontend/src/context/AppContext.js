import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { cacheService } from "../services/cacheService";
import { isAdminEmail } from "../config/admin";
import { userService } from "../services/userService";
import { notificationService } from "../services/notificationService";
import { authService } from "../services/authService";

const AppContext = createContext(null);

const initialState = {
  user: null,
  role: null, // "user" | "admin"
  isLoading: false,
  profile: {
    nickname: "",
    username: "",
    avatar: "cat",
    avatarUrl: null,
    joinedDate: "Jan 2024",
    bio: "Just sharing thoughts and feelings in my bubble.",
    onboarded: null,
  },
  posts: [],
  reposts: [],
  commentsByPostId: {},
  myCommentReactions: {},
  myReactions: {},
  notifications: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
      };
    case "LOGOUT":
      return initialState;
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_PROFILE":
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
      };
    case "UPDATE_MY_POSTS_AUTHOR": {
      const { uid, nickname, avatar, avatarUrl } = action.payload || {};
      if (!uid) return state;
      return {
        ...state,
        posts: state.posts.map((p) => {
          if (p.userId !== uid) return p;
          return {
            ...p,
            nickname: nickname || p.nickname,
            avatar: avatar || p.avatar,
            avatarUrl: avatarUrl ?? p.avatarUrl ?? null,
          };
        }),
      };
    }
    case "SET_AVATAR":
      return {
        ...state,
        profile: { ...state.profile, avatar: action.payload, avatarUrl: null },
        posts: state.posts.map((post) => {
          if (!state.user?.uid) return post;
          return post.userId === state.user.uid
            ? { ...post, avatar: action.payload, avatarUrl: null }
            : post;
        }),
      };
    case "SET_NICKNAME":
      return {
        ...state,
        profile: { ...state.profile, nickname: action.payload },
      };
    case "SET_POSTS":
      return { ...state, posts: action.payload };
    case "SET_REPOSTS":
      return { ...state, reposts: action.payload };
    case "ADD_POST":
      return { ...state, posts: [action.payload, ...state.posts] };
    case "REPLACE_POST": {
      const { tempId, post } = action.payload || {};
      if (!tempId || !post) return state;
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === tempId ? post : p)),
      };
    }
    case "DELETE_POST":
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
      };
    case "TOGGLE_REACTION": {
      const { postId } = action.payload;
      const prev = state.myReactions[postId] || null;
      const next = prev === "heart" ? null : "heart";

      const posts = state.posts.map((post) => {
        if (post.id !== postId) return post;

        const reactions = { ...(post.reactions || { heart: 0 }) };
        const current = Number(reactions.heart || 0);
        const nextCount = next ? current + 1 : Math.max(0, current - 1);
        return { ...post, reactions: { heart: nextCount } };
      });

      const myReactions = { ...state.myReactions };
      if (next) myReactions[postId] = "heart";
      else delete myReactions[postId];

      return { ...state, posts, myReactions };
    }
    case "ADD_REPOST":
      return { ...state, reposts: [action.payload, ...state.reposts] };
    case "DELETE_REPOST":
      return {
        ...state,
        reposts: state.reposts.filter((r) => r.id !== action.payload),
      };
    case "ADD_COMMENT": {
      const { postId, comment } = action.payload;
      const prev = state.commentsByPostId[postId] || [];
      return {
        ...state,
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: [comment, ...prev],
        },
        posts: state.posts.map((p) =>
          p.id === postId
            ? { ...p, commentCount: (p.commentCount || p.comments || 0) + 1 }
            : p
        ),
      };
    }
    case "REPLACE_COMMENT": {
      const { postId, tempId, comment } = action.payload || {};
      if (!postId || !tempId || !comment) return state;
      const prev = state.commentsByPostId[postId] || [];
      return {
        ...state,
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: prev.map((c) => (c.id === tempId ? comment : c)),
        },
      };
    }
    case "DELETE_COMMENT_LOCAL": {
      const { postId, commentId } = action.payload || {};
      if (!postId || !commentId) return state;
      const prev = state.commentsByPostId[postId] || [];
      return {
        ...state,
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: prev.filter((c) => c.id !== commentId),
        },
        posts: state.posts.map((p) =>
          p.id === postId
            ? { ...p, commentCount: Math.max(0, (p.commentCount || p.comments || 0) - 1), comments: Math.max(0, (p.comments || p.commentCount || 0) - 1) }
            : p
        ),
      };
    }
    case "SET_COMMENTS_FOR_POST": {
      const { postId, comments } = action.payload;
      return {
        ...state,
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: Array.isArray(comments) ? comments : [],
        },
      };
    }
    case "SET_MY_REACTIONS":
      return { ...state, myReactions: action.payload || {} };
    case "SET_MY_REACTION": {
      const { postId, reactionKey } = action.payload;
      const myReactions = { ...state.myReactions };
      if (reactionKey) myReactions[postId] = reactionKey;
      else delete myReactions[postId];
      return { ...state, myReactions };
    }
    case "SET_POST_REACTIONS": {
      const { postId, reactions } = action.payload;
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === postId ? { ...p, reactions } : p)),
      };
    }
    case "SET_COMMENT_REACTIONS": {
      const { postId, commentId, reactions } = action.payload || {};
      if (!postId || !commentId || !reactions) return state;
      const prevList = state.commentsByPostId[postId] || [];
      const nextList = prevList.map((c) => (c.id === commentId ? { ...c, reactions } : c));
      return {
        ...state,
        commentsByPostId: { ...state.commentsByPostId, [postId]: nextList },
      };
    }
    case "TOGGLE_COMMENT_REACTION": {
      const { postId, commentId, reactionKey } = action.payload || {};
      if (!postId || !commentId || !reactionKey) return state;

      const mapKey = `${postId}:${commentId}`;
      const prevKey = state.myCommentReactions[mapKey] || null;
      const nextKey = prevKey === reactionKey ? null : reactionKey;

      const prevList = state.commentsByPostId[postId] || [];
      const nextList = prevList.map((c) => {
        if (c.id !== commentId) return c;
        const reactions = { ...(c.reactions || { heart: 0 }) };
        if (prevKey) reactions[prevKey] = Math.max(0, (reactions[prevKey] || 0) - 1);
        if (nextKey) reactions[nextKey] = (reactions[nextKey] || 0) + 1;
        return { ...c, reactions };
      });

      const myCommentReactions = { ...state.myCommentReactions };
      if (nextKey) myCommentReactions[mapKey] = nextKey;
      else delete myCommentReactions[mapKey];

      return {
        ...state,
        myCommentReactions,
        commentsByPostId: { ...state.commentsByPostId, [postId]: nextList },
      };
    }
    case "SET_MY_COMMENT_REACTIONS_FOR_POST": {
      const { postId, map } = action.payload || {};
      if (!postId) return state;
      const next = { ...state.myCommentReactions };
      const entries = map && typeof map === "object" ? Object.entries(map) : [];
      for (const [commentId, key] of entries) {
        const mapKey = `${postId}:${commentId}`;
        if (key) next[mapKey] = key;
        else delete next[mapKey];
      }
      return { ...state, myCommentReactions: next };
    }
    case "MARK_NOTIFICATION_READ": {
      const id = action.payload;
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      };
    }
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: Array.isArray(action.payload) ? action.payload : [] };
    case "RESET_APP_STATE":
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  useEffect(() => {
    let alive = true;
    let notifTimer = null;
    let authTimer = null;

    // Cache preload
    (async () => {
      try {
        const cached = await cacheService.getUser();
        if (!alive || !cached) return;
        dispatch(appActions.setUser({ email: cached.email, uid: cached.uid }));
        dispatch(appActions.setProfile(cached));
        dispatch(appActions.setRole(isAdminEmail(cached.email) ? "admin" : "user"));
      } catch (e) {
        // ignore cache errors (keep app usable)
      }
    })();

    const hydrate = async () => {
      try {
        const me = await userService.getMe();
        if (!alive || !me) return;

        const profile = {
          uid: me.id,
          email: me.email,
          role: me.role,
          banned: !!me.banned,
          onboarded: !!me.onboarded,
          username: me.username || "",
          nickname: me.nickname || "@anonymous",
          bio: me.bio || "",
          avatar: me.avatar || "cat",
          avatarUrl: me.avatarUrl || null,
        };

        dispatch(appActions.setUser({ uid: profile.uid, email: profile.email }));
        dispatch(appActions.setRole(profile.role || (isAdminEmail(profile.email) ? "admin" : "user")));
        dispatch(appActions.setProfile(profile));
        await cacheService.saveUser(profile);
      } catch {
        // ignore (offline)
      }
    };

    hydrate();

    authTimer = setInterval(async () => {
      try {
        if (!alive) return;
        const t = await cacheService.getToken();
        if (!t && state.user) dispatch(appActions.logout());
      } catch {
        // ignore
      }
    }, 2000);

    notifTimer = setInterval(async () => {
      try {
        if (!alive) return;
        const token = await cacheService.getToken();
        if (!token) return;
        const items = await notificationService.getMyNotifications(null, { pageSize: 30 });
        dispatch(appActions.setNotifications(items));
      } catch {
        // ignore
      }
    }, 20000);

    return () => {
      alive = false;
      if (authTimer) clearInterval(authTimer);
      if (notifTimer) clearInterval(notifTimer);
    };
  }, [state.user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export const appActions = {
  login: (user, role = "user") => ({ type: "LOGIN", payload: { user, role } }),
  logout: () => ({ type: "LOGOUT" }),
  setUser: (user) => ({ type: "SET_USER", payload: user }),
  setRole: (role) => ({ type: "SET_ROLE", payload: role }),
  setLoading: (isLoading) => ({ type: "SET_LOADING", payload: isLoading }),
  setProfile: (profile) => ({ type: "SET_PROFILE", payload: profile }),
  updateMyPostsAuthor: (uid, updates) => ({
    type: "UPDATE_MY_POSTS_AUTHOR",
    payload: { uid, ...(updates || {}) },
  }),
  setAvatar: (avatar) => ({ type: "SET_AVATAR", payload: avatar }),
  setNickname: (nickname) => ({ type: "SET_NICKNAME", payload: nickname }),
  setPosts: (posts) => ({ type: "SET_POSTS", payload: posts }),
  setReposts: (reposts) => ({ type: "SET_REPOSTS", payload: reposts }),
  addPost: (post) => ({ type: "ADD_POST", payload: post }),
  replacePost: (tempId, post) => ({ type: "REPLACE_POST", payload: { tempId, post } }),
  deletePost: (postId) => ({ type: "DELETE_POST", payload: postId }),
  addRepost: (repost) => ({ type: "ADD_REPOST", payload: repost }),
  deleteRepost: (repostId) => ({ type: "DELETE_REPOST", payload: repostId }),
  addComment: (postId, comment) => ({
    type: "ADD_COMMENT",
    payload: { postId, comment },
  }),
  replaceComment: (postId, tempId, comment) => ({
    type: "REPLACE_COMMENT",
    payload: { postId, tempId, comment },
  }),
  deleteCommentLocal: (postId, commentId) => ({
    type: "DELETE_COMMENT_LOCAL",
    payload: { postId, commentId },
  }),
  setCommentsForPost: (postId, comments) => ({
    type: "SET_COMMENTS_FOR_POST",
    payload: { postId, comments },
  }),
  toggleCommentReaction: (postId, commentId, reactionKey) => ({
    type: "TOGGLE_COMMENT_REACTION",
    payload: { postId, commentId, reactionKey },
  }),
  setMyCommentReactionsForPost: (postId, map) => ({
    type: "SET_MY_COMMENT_REACTIONS_FOR_POST",
    payload: { postId, map },
  }),
  toggleReaction: (postId, reactionKey) => ({
    type: "TOGGLE_REACTION",
    payload: { postId, reactionKey },
  }),
  setMyReactions: (map) => ({ type: "SET_MY_REACTIONS", payload: map }),
  setMyReaction: (postId, reactionKey) => ({
    type: "SET_MY_REACTION",
    payload: { postId, reactionKey },
  }),
  setPostReactions: (postId, reactions) => ({
    type: "SET_POST_REACTIONS",
    payload: { postId, reactions },
  }),
  setCommentReactions: (postId, commentId, reactions) => ({
    type: "SET_COMMENT_REACTIONS",
    payload: { postId, commentId, reactions },
  }),
  markNotificationRead: (id) => ({ type: "MARK_NOTIFICATION_READ", payload: id }),
  markAllNotificationsRead: () => ({ type: "MARK_ALL_NOTIFICATIONS_READ" }),
  setNotifications: (items) => ({ type: "SET_NOTIFICATIONS", payload: items }),
  reset: () => ({ type: "RESET_APP_STATE" }),
};
