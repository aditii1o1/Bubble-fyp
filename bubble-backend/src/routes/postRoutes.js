import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { postController } from "../controllers/postController.js";
import { commentController } from "../controllers/commentController.js";
import { reactionController } from "../controllers/reactionController.js";
import { repostController } from "../controllers/repostController.js";

const router = express.Router();

router.get("/feed", requireAuth, postController.getFeed);
router.get("/user/:userId", requireAuth, postController.getUserPosts);
router.get("/:postId", requireAuth, postController.getPostById);
router.post("/", requireAuth, postController.createPost);
router.delete("/:postId", requireAuth, postController.deletePost);

router.get("/:postId/comments", requireAuth, commentController.getComments);
router.post("/:postId/comments", requireAuth, commentController.addComment);
router.delete("/:postId/comments/:commentId", requireAuth, commentController.deleteComment);
router.post("/:postId/comments/:commentId/reactions/toggle", requireAuth, commentController.toggleCommentLike);

router.post("/:postId/reactions/toggle", requireAuth, reactionController.togglePostReaction);
router.post("/reactions/my-map", requireAuth, reactionController.getMyReactionsMap);

router.post("/:postId/reposts", requireAuth, repostController.createRepost);

export default router;
