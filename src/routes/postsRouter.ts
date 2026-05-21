import { Router } from "express";
import { createPost, removeUserPost, getAllPosts } from "../controllers/postsController.ts";

const postsRouter = Router({mergeParams: true});

postsRouter.route("/")
  .get(getAllPosts)
  .post(createPost as any)
  .delete(removeUserPost as any);

export default postsRouter;