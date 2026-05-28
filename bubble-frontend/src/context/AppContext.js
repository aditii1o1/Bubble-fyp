import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { AppState } from "react-native";
import { cacheService } from "../services/cacheService";
import { isAdminEmail } from "../config/admin";
import { userService } from "../services/userService";
import { notificationService } from "../services/notificationService";
import { useToast } from "./ToastContext";
import { DEFAULT_REACTION_COUNTS, normalizeReactionKey } from "../constants/reactions";

const AppContext = createContext(null);

const initialState = {
  user: null,
  role: null, // "user" | "admin"
  isLoading: true,
  profile: {
    nickname: "",
    username: "",
    avatar: "cat",
    avatarUrl: null,
    createdAt: null,
    bio: "Just sharing thoughts and feelings in my bubble.",
    onboarded: null,
  },
  posts: [],
  reposts: [],
  commentsByPostId: {},
  myCommentReactions: {},
  myReactions: {},
  authorProfiles: {},
  notifications: [],
};

const loggedOutState = { ...initialState, isLoading: false };

function getInAppNotificationMessage(notification) {
  const actor = notification?.fromNickname || "Someone";
  if (notification?.text) return notification.text;
  if (notification?.type === "reaction") return `${actor} reacted to your bubble`;
  if (notification?.type === "comment") return `${actor} commented on your bubble`;
  if (notification?.type === "repost") return `${actor} reposted your bubble`;
  if (notification?.type === "broadcast") return "New announcement from Bubble";
  return "You have a new notification";
}

function mergeIncomingPostsWithPending(existingPosts, incomingPosts) {
  const nextPosts = Array.isArray(incomingPosts) ? incomingPosts : [];
  const pendingPosts = (Array.isArray(existingPosts) ? existingPosts : []).filter(
    (post) => post?.isPending
  );

  if (!pendingPosts.length) return nextPosts;

  const nextIds = new Set(nextPosts.map((post) => String(post?.id || "")));
  const preservedPending = pendingPosts.filter((post) => !nextIds.has(String(post?.id || "")));
  return [...preservedPending, ...nextPosts];
}

function normalizeReactionCounts(reactions = {}) {
  const acc = Object.keys(DEFAULT_REACTION_COUNTS).reduce((next, key) => {
    const value = Number(reactions?.[key] || 0);
    next[key] = Number.isFinite(value) ? value : 0;
    return next;
  }, {});

  Object.entries(reactions || {}).forEach(([key, value]) => {
    if (Object.prototype.hasOwnProperty.call(acc, key)) return;
    const count = Number(value || 0);
    if (Number.isFinite(count) && count > 0) acc[key] = count;
  });

  return acc;
}

function normalizeAuthorProfile(profile = {}) {
  const id = String(profile?.id || profile?.uid || "").trim();
  if (!id) return null;

  return {
    id,
    uid: id,
    nickname: profile.nickname || "@anonymous",
    username: profile.username || "",
    bio: Object.prototype.hasOwnProperty.call(profile, "bio")
      ? String(profile.bio || "")
      : "",
    avatar: profile.avatar || "cat",
    avatarUrl: profile.avatarUrl || null,
    createdAt: profile.createdAt || null,
    updatedAt: profile.updatedAt || null,
  };
}

function mergeAuthorProfile(previous, next) {
  const normalized = normalizeAuthorProfile(next);
  if (!normalized) return previous || null;

  return {
    ...(previous || {}),
    ...normalized,
    bio: Object.prototype.hasOwnProperty.call(next || {}, "bio")
      ? String(next.bio || "")
      : previous?.bio || normalized.bio || "",
    avatarUrl: Object.prototype.hasOwnProperty.call(next || {}, "avatarUrl")
      ? next.avatarUrl || null
      : previous?.avatarUrl ?? normalized.avatarUrl ?? null,
  };
}

function applyAuthorProfilesToPosts(posts = [], authorProfiles = {}) {
  if (!Array.isArray(posts) || !posts.length) return Array.isArray(posts) ? posts : [];

  return posts.map((post) => {
    const userId = String(post?.userId || "");
    const profile = userId ? authorProfiles[userId] : null;
    if (!profile) return post;

    const nextNickname = profile.nickname || post.nickname;
    const nextAvatar = profile.avatar || post.avatar;
    const nextAvatarUrl = Object.prototype.hasOwnProperty.call(profile, "avatarUrl")
      ? profile.avatarUrl || null
      : post.avatarUrl ?? null;

    if (
      post.nickname === nextNickname &&
      post.avatar === nextAvatar &&
      (post.avatarUrl || null) === nextAvatarUrl
    ) {
      return post;
    }

    return {
      ...post,
      nickname: nextNickname,
      avatar: nextAvatar,
      avatarUrl: nextAvatarUrl,
    };
  });
}

function appReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
      };
    case "LOGOUT":
      return loggedOutState;
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_PROFILE":
    {
      const nextState = {
        ...state,
        profile: { ...state.profile, ...action.payload },
      };
      const profileId = action.payload?.uid || action.payload?.id || state.user?.uid;
      if (!profileId) return nextState;

      const authorProfile = mergeAuthorProfile(state.authorProfiles[profileId], {
        id: profileId,
        ...action.payload,
      });
      if (!authorProfile) return nextState;

      const authorProfiles = {
        ...state.authorProfiles,
        [authorProfile.id]: authorProfile,
      };

      return {
        ...nextState,
        authorProfiles,
        posts: applyAuthorProfilesToPosts(nextState.posts, authorProfiles),
      };
    }
    case "UPDATE_MY_POSTS_AUTHOR":
    case "UPDATE_POSTS_AUTHOR": {
      const { uid, nickname, avatar, avatarUrl } = action.payload || {};
      if (!uid) return state;
      const authorProfile = mergeAuthorProfile(state.authorProfiles[uid], action.payload);
      const authorProfiles = authorProfile
        ? { ...state.authorProfiles, [authorProfile.id]: authorProfile }
        : state.authorProfiles;
      let changed = false;
      const posts = state.posts.map((p) => {
        if (p.userId !== uid) return p;

        const nextNickname = nickname || p.nickname;
        const nextAvatar = avatar || p.avatar;
        const nextAvatarUrl = Object.prototype.hasOwnProperty.call(
          action.payload || {},
          "avatarUrl"
        )
          ? avatarUrl || null
          : p.avatarUrl ?? null;

        if (
          p.nickname === nextNickname &&
          p.avatar === nextAvatar &&
          (p.avatarUrl || null) === nextAvatarUrl
        ) {
          return p;
        }

        changed = true;
        return {
          ...p,
          nickname: nextNickname,
          avatar: nextAvatar,
          avatarUrl: nextAvatarUrl,
        };
      });

      if (!changed) {
        return authorProfiles === state.authorProfiles ? state : { ...state, authorProfiles };
      }
      return {
        ...state,
        authorProfiles,
        posts,
      };
    }
    case "SET_AVATAR": {
      const uid = state.user?.uid;
      const authorProfile = uid
        ? mergeAuthorProfile(state.authorProfiles[uid], {
            id: uid,
            avatar: action.payload,
            avatarUrl: null,
          })
        : null;
      const authorProfiles = authorProfile
        ? { ...state.authorProfiles, [authorProfile.id]: authorProfile }
        : state.authorProfiles;
      return {
        ...state,
        authorProfiles,
        profile: { ...state.profile, avatar: action.payload, avatarUrl: null },
        posts: state.posts.map((post) => {
          if (!uid) return post;
          return post.userId === uid
            ? { ...post, avatar: action.payload, avatarUrl: null }
            : post;
        }),
      };
    }
    case "SET_NICKNAME":
      return {
        ...state,
        profile: { ...state.profile, nickname: action.payload },
      };
    case "SET_AUTHOR_PROFILE": {
      const authorProfile = mergeAuthorProfile(
        state.authorProfiles[action.payload?.id || action.payload?.uid],
        action.payload
      );
      if (!authorProfile) return state;
      const authorProfiles = {
        ...state.authorProfiles,
        [authorProfile.id]: authorProfile,
      };
      return {
        ...state,
        authorProfiles,
        posts: applyAuthorProfilesToPosts(state.posts, authorProfiles),
      };
    }
    case "SET_POSTS":
      return {
        ...state,
        posts: applyAuthorProfilesToPosts(
          mergeIncomingPostsWithPending(state.posts, action.payload),
          state.authorProfiles
        ),
      };
    case "SET_REPOSTS":
      return { ...state, reposts: action.payload };
    case "ADD_POST":
      return {
        ...state,
        posts: applyAuthorProfilesToPosts(
          [action.payload, ...state.posts],
          state.authorProfiles
        ),
      };
    case "REPLACE_POST": {
      const { tempId, post } = action.payload || {};
      if (!tempId || !post) return state;
      return {
        ...state,
        posts: applyAuthorProfilesToPosts(
          state.posts.map((p) => (p.id === tempId ? post : p)),
          state.authorProfiles
        ),
      };
    }
    case "DELETE_POST":
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
      };
    case "TOGGLE_REACTION": {
      const { postId, reactionKey } = action.payload;
      const requestedKey = normalizeReactionKey(reactionKey);
      const prev = state.myReactions[postId] || null;
      const next = prev === requestedKey ? null : requestedKey;

      const posts = state.posts.map((post) => {
        if (post.id !== postId) return post;

        const reactions = normalizeReactionCounts(post.reactions);
        if (prev) reactions[prev] = Math.max(0, Number(reactions[prev] || 0) - 1);
        if (next) reactions[next] = Number(reactions[next] || 0) + 1;
        return { ...post, reactions };
      });

      const myReactions = { ...state.myReactions };
      if (next) myReactions[postId] = next;
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
    case "SET_MY_REACTIONS": {
      const entries = Object.entries(action.payload || {});
      const myReactions = entries.reduce((acc, [postId, reactionKey]) => {
        if (reactionKey) acc[postId] = normalizeReactionKey(reactionKey);
        return acc;
      }, {});
      return { ...state, myReactions };
    }
    case "SET_MY_REACTION": {
      const { postId, reactionKey } = action.payload;
      const myReactions = { ...state.myReactions };
      if (reactionKey) myReactions[postId] = normalizeReactionKey(reactionKey);
      else delete myReactions[postId];
      return { ...state, myReactions };
    }
    case "SET_POST_REACTIONS": {
      const { postId, reactions } = action.payload;
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, reactions: normalizeReactionCounts(reactions) } : p
        ),
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
      return loggedOutState;
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { showToast } = useToast();
  const appStateRef = useRef(AppState.currentState || "active");
  const notificationsPrimedRef = useRef(false);
  const seenNotificationIdsRef = useRef(new Set());

  const value = useMemo(() => ({ state, dispatch }), [state]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState || "active";
    });

    return () => {
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    let releasedLoading = false;

    const finishLoading = () => {
      if (releasedLoading || !alive) return;
      releasedLoading = true;
      dispatch(appActions.setLoading(false));
    };

    (async () => {
      try {
        const session = await cacheService.getAuthSession();
        const cached = session?.user || null;
        const token = session?.token || "";
        if (!alive) return;

        if (cached && token) {
          dispatch(appActions.setProfile(cached));
          dispatch(
            appActions.setRole(
              cached.role || (isAdminEmail(cached.email) ? "admin" : "user")
            )
          );
          dispatch(appActions.setUser({ email: cached.email, uid: cached.uid }));
          finishLoading();
        }

        if (!token) {
          finishLoading();
          return;
        }

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
          createdAt: me.createdAt || null,
        };

        dispatch(appActions.setRole(profile.role || (isAdminEmail(profile.email) ? "admin" : "user")));
        dispatch(appActions.setProfile(profile));
        dispatch(appActions.setUser({ uid: profile.uid, email: profile.email }));
        await cacheService.saveUser(profile);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          await cacheService.clearAuth();
          if (alive) dispatch(appActions.logout());
          return;
        }
        // ignore (offline)
      } finally {
        finishLoading();
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    let notifTimer = null;
    let appStateSub = null;

    const loadNotifications = async (force = false) => {
      if (!alive || !state.user?.uid) return;
      if (!force && appStateRef.current !== "active") return;
      try {
        const cachedSession = cacheService.getCachedAuthSession();
        const token = cachedSession?.token || (await cacheService.getToken());
        if (!token) {
          if (alive) dispatch(appActions.logout());
          return;
        }
        const items = await notificationService.getMyNotifications(null, { pageSize: 30 });
        if (alive) dispatch(appActions.setNotifications(items));
      } catch {
        // ignore
      }
    };

    if (state.user?.uid) {
      void loadNotifications(true);
      notifTimer = setInterval(() => {
        void loadNotifications(false);
      }, 60000);
      appStateSub = AppState.addEventListener("change", (nextState) => {
        appStateRef.current = nextState || "active";
        if (nextState === "active") {
          void loadNotifications(true);
        }
      });
    } else {
      notificationsPrimedRef.current = false;
      seenNotificationIdsRef.current = new Set();
    }

    return () => {
      alive = false;
      if (notifTimer) clearInterval(notifTimer);
      appStateSub?.remove?.();
    };
  }, [dispatch, state.user?.uid]);

  useEffect(() => {
    if (!state.user?.uid) {
      notificationsPrimedRef.current = false;
      seenNotificationIdsRef.current = new Set();
      return;
    }

    const ids = new Set((state.notifications || []).map((item) => String(item?.id || "")));
    if (!notificationsPrimedRef.current) {
      notificationsPrimedRef.current = true;
      seenNotificationIdsRef.current = ids;
      return;
    }

    const newUnread = (state.notifications || []).filter(
      (item) => item && !item.read && !seenNotificationIdsRef.current.has(String(item.id || ""))
    );

    seenNotificationIdsRef.current = ids;

    if (!newUnread.length || appStateRef.current !== "active") return;

    const newest = [...newUnread].sort((a, b) =>
      String(b?.createdAt || "").localeCompare(String(a?.createdAt || ""))
    )[0];

    if (!newest) return;

    showToast(getInAppNotificationMessage(newest), {
      type: "info",
      durationMs: 3200,
    });
  }, [showToast, state.notifications, state.user?.uid]);

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
  updatePostsAuthor: (uid, updates) => ({
    type: "UPDATE_POSTS_AUTHOR",
    payload: { uid, ...(updates || {}) },
  }),
  setAuthorProfile: (profile) => ({
    type: "SET_AUTHOR_PROFILE",
    payload: profile,
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
